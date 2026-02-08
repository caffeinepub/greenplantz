import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Type Definitions
  public type CategoryId = Nat;
  public type ProductId = Nat;
  public type OrderId = Nat;
  public type GardenCenterId = Nat;

  public type Category = {
    id : CategoryId;
    name : Text;
    description : Text;
  };

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    categoryId : CategoryId;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : GardenCenterId;
    imageUrls : [Text]; // New image URLs field
  };

  public type OrderItem = {
    productId : ProductId;
    quantity : Nat;
    pricePerItem : Nat;
  };

  public type Order = {
    id : OrderId;
    products : [OrderItem];
    totalAmountCents : Nat;
    createdAt : Time.Time;
    status : {
      #placed;
      #shipped;
      #delivered;
      #cancelled;
    };
  };

  public type UserProfile = {
    name : Text;
  };

  public type TeamMember = {
    principal : Principal;
    enabled : Bool;
  };

  public type GardenCenter = {
    id : Nat;
    name : Text;
    location : Text;
    teamMembers : [TeamMember];
    enabled : Bool;
    createdAt : Int;
  };

  public type CallerRole = {
    isPlatformAdmin : Bool;
    isCustomer : Bool;
    gardenCenterMemberships : [GardenCenterId];
  };

  module Product {
    public func compare(a : Product, b : Product) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // State Management
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextCategoryId = 0;
  var nextProductId = 0;
  var nextGardenCenterId = 0;

  let categories = Map.empty<CategoryId, Category>();
  let products = Map.empty<ProductId, Product>();
  let orders = Map.empty<Principal, Map.Map<OrderId, Order>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let gardenCenters = Map.empty<GardenCenterId, { id : Nat; name : Text; location : Text; teamMembers : List.List<TeamMember>; enabled : Bool; createdAt : Int }>();

  // Helper Functions
  func containsSearchTerm(haystack : Text, needle : Text) : Bool {
    let haystackChars = haystack.toArray();
    let needleChars = needle.toArray();
    let haystackLen = haystackChars.size();
    let needleLen = needleChars.size();

    if (needleLen == 0 or needleLen > haystackLen) {
      return false;
    };

    var i = 0;
    while (i <= (haystackLen - needleLen)) {
      if (haystackChars[i] == needleChars[0]) {
        var match = true;
        var j = 1;

        while (j < needleLen and match) {
          if (haystackChars[i + j] != needleChars[j]) {
            match := false;
          };
          j += 1;
        };

        if (match) { return true };
      };
      i += 1;
    };
    false;
  };

  func getProductById(productId : ProductId) : ?Product {
    products.get(productId);
  };

  func isPlatformAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func isGardenCenterMember(gardenCenterId : GardenCenterId, caller : Principal) : Bool {
    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { false };
      case (?gardenCenter) {
        if (not gardenCenter.enabled) { return false };
        switch (gardenCenter.teamMembers.find(func(member : TeamMember) : Bool {
          member.principal == caller and member.enabled
        })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  func getGardenCenterMemberships(caller : Principal) : [GardenCenterId] {
    let memberships = List.empty<GardenCenterId>();
    for ((id, gardenCenter) in gardenCenters.entries()) {
      if (gardenCenter.enabled and isGardenCenterMember(id, caller)) {
        memberships.add(id);
      };
    };
    memberships.toArray();
  };

  func assertPlatformAdmin(caller : Principal) {
    if (not isPlatformAdmin(caller)) {
      Runtime.trap("Unauthorized: Only platform admins can perform this action");
    };
  };

  func assertGardenCenterMember(gardenCenterId : GardenCenterId, caller : Principal) {
    if (not isPlatformAdmin(caller) and not isGardenCenterMember(gardenCenterId, caller)) {
      Runtime.trap("Unauthorized: Must be a member of this garden center or platform admin");
    };
  };

  func assertProductOwnership(productId : ProductId, caller : Principal) {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not isPlatformAdmin(caller) and not isGardenCenterMember(product.gardenCenterId, caller)) {
          Runtime.trap("Unauthorized: Can only manage products from your own garden center");
        };
      };
    };
  };

  func addOrder(caller : Principal, order : Order) {
    let userOrders = switch (orders.get(caller)) {
      case (?existing) { existing };
      case (null) { Map.empty<OrderId, Order>() };
    };
    userOrders.add(order.id, order);
    orders.add(caller, userOrders);
  };

  // Role Query Functions
  public query ({ caller }) func getCallerRole() : async CallerRole {
    {
      isPlatformAdmin = isPlatformAdmin(caller);
      isCustomer = AccessControl.hasPermission(accessControlState, caller, #user);
      gardenCenterMemberships = getGardenCenterMemberships(caller);
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isPlatformAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Garden Center Functions
  public shared ({ caller }) func createGardenCenter(name : Text, location : Text) : async GardenCenterId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create garden centers");
    };

    let gardenCenterId = nextGardenCenterId;
    let teamMembers = List.empty<TeamMember>();
    teamMembers.add({
      principal = caller;
      enabled = true;
    });

    let newGardenCenter = {
      id = gardenCenterId;
      name;
      location;
      teamMembers;
      enabled = true;
      createdAt = Time.now();
    };

    gardenCenters.add(gardenCenterId, newGardenCenter);
    nextGardenCenterId += 1;
    gardenCenterId;
  };

  // New function to remove (disable) a garden center permanently
  public shared ({ caller }) func removeGardenCenter(
    gardenCenterId : GardenCenterId
  ) : async () {
    assertPlatformAdmin(caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedGardenCenter = {
          gardenCenter with
          enabled = false;
        };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  public shared ({ caller }) func updateGardenCenter(
    gardenCenterId : GardenCenterId,
    name : Text,
    location : Text,
  ) : async () {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedGardenCenter = {
          gardenCenter with
          name = name;
          location = location;
        };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  public shared ({ caller }) func addGardenCenterMember(
    gardenCenterId : GardenCenterId,
    memberPrincipal : Principal,
  ) : async () {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        switch (gardenCenter.teamMembers.find(func(m : TeamMember) : Bool {
          m.principal == memberPrincipal
        })) {
          case (?_) { Runtime.trap("Member already exists in this garden center") };
          case (null) {
            let newMember : TeamMember = {
              principal = memberPrincipal;
              enabled = true;
            };
            gardenCenter.teamMembers.add(newMember);
            gardenCenters.add(gardenCenterId, gardenCenter);
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeGardenCenterMember(
    gardenCenterId : GardenCenterId,
    memberPrincipal : Principal,
  ) : async () {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedMembers = gardenCenter.teamMembers.filter(func(m : TeamMember) : Bool {
          m.principal != memberPrincipal
        });
        let updatedGardenCenter = {
          gardenCenter with
          teamMembers = updatedMembers;
        };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  public shared ({ caller }) func disableGardenCenterMember(
    gardenCenterId : GardenCenterId,
    memberPrincipal : Principal,
  ) : async () {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedMembers = gardenCenter.teamMembers.map<TeamMember, TeamMember>(func(m) {
          if (m.principal == memberPrincipal) {
            { m with enabled = false };
          } else {
            m;
          };
        });
        let updatedGardenCenter = {
          gardenCenter with
          teamMembers = updatedMembers;
        };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  public shared ({ caller }) func enableGardenCenterMember(
    gardenCenterId : GardenCenterId,
    memberPrincipal : Principal,
  ) : async () {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedMembers = gardenCenter.teamMembers.map<TeamMember, TeamMember>(func(m) {
          if (m.principal == memberPrincipal) {
            { m with enabled = true };
          } else {
            m;
          };
        });
        let updatedGardenCenter = {
          gardenCenter with
          teamMembers = updatedMembers;
        };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  // Public Query Functions
  public query ({ caller }) func getGardenCenters() : async [GardenCenter] {
    gardenCenters.values().map(
      func(gc) {
        {
          id = gc.id;
          name = gc.name;
          location = gc.location;
          teamMembers = gc.teamMembers.toArray();
          enabled = gc.enabled;
          createdAt = gc.createdAt;
        };
      }
    ).toArray();
  };

  public query ({ caller }) func getGardenCenter(gardenCenterId : GardenCenterId) : async GardenCenter {
    switch (gardenCenters.get(gardenCenterId)) {
      case (?gardenCenter) {
        {
          id = gardenCenter.id;
          name = gardenCenter.name;
          location = gardenCenter.location;
          teamMembers = gardenCenter.teamMembers.toArray();
          enabled = gardenCenter.enabled;
          createdAt = gardenCenter.createdAt;
        };
      };
      case (null) { Runtime.trap("Garden Center not found") };
    };
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getActiveProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.active });
  };

  public query ({ caller }) func getProductsForCategory(categoryId : CategoryId) : async [Product] {
    products.values().toArray().filter(func(p) { p.active and p.categoryId == categoryId });
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (getProductById(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.active and containsSearchTerm(p.name, searchTerm)
      }
    ).sort();
  };

  public query ({ caller }) func getProductsForGardenCenter(gardenCenterId : GardenCenterId) : async [Product] {
    products.values().toArray().filter(func(p) { p.gardenCenterId == gardenCenterId });
  };

  // Protected User Functions
  public shared ({ caller }) func placeOrder(items : [OrderItem]) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let now = Time.now();
    let orderId = now.toNat();

    var totalAmount = 0;
    let validItems = items.filter(func(i) { switch (products.get(i.productId)) { case (null) { false }; case (_) { true } } });

    for (item in validItems.values()) {
      totalAmount += item.quantity * item.pricePerItem;
    };

    let order : Order = {
      id = orderId;
      products = validItems;
      totalAmountCents = totalAmount;
      createdAt = Time.now();
      status = #placed;
    };

    addOrder(caller, order);
    orderId;
  };

  // Admin Functions
  public shared ({ caller }) func addCategory(name : Text, description : Text) : async CategoryId {
    assertPlatformAdmin(caller);

    let newCategory = {
      id = nextCategoryId;
      name;
      description;
    };
    categories.add(nextCategoryId, newCategory);
    nextCategoryId += 1;
    newCategory.id;
  };

  // Product Management Functions
  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    categoryId : CategoryId,
    priceCents : Nat,
    stock : Nat,
    gardenCenterId : GardenCenterId,
    imageUrls : [Text], // New parameter
  ) : async ProductId {
    assertGardenCenterMember(gardenCenterId, caller);

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (_) {};
    };

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (_) {};
    };

    let newProduct = {
      id = nextProductId;
      name;
      description;
      categoryId;
      priceCents;
      stock;
      active = true;
      gardenCenterId;
      imageUrls; // Store provided image URLs
    };

    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func updateProduct(
    productId : ProductId,
    name : Text,
    description : Text,
    categoryId : CategoryId,
    priceCents : Nat,
    stock : Nat,
    imageUrls : [Text], // New parameter
  ) : async () {
    assertProductOwnership(productId, caller);

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (_) {};
    };

    switch (products.get(productId)) {
      case (?product) {
        let updatedProduct = {
          product with
          name = name;
          description = description;
          categoryId = categoryId;
          priceCents = priceCents;
          stock = stock;
          imageUrls = imageUrls; // Update image URLs
        };
        products.add(productId, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func toggleProductActive(productId : ProductId, active : Bool) : async () {
    assertProductOwnership(productId, caller);

    switch (products.get(productId)) {
      case (?product) {
        let updatedProduct = { product with active };
        products.add(productId, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  // Seed Data Initialization
  public shared ({ caller }) func initializeSeedData() : async () {
    assertPlatformAdmin(caller);

    nextCategoryId := 0;
    categories.clear();
    nextProductId := 0;
    products.clear();

    // Add categories
    let plantCategoryId = nextCategoryId;
    categories.add(
      plantCategoryId,
      {
        id = plantCategoryId;
        name = "Plants";
        description = "All types of house and garden plants";
      },
    );
    nextCategoryId += 1;

    let soilCategoryId = nextCategoryId;
    categories.add(
      soilCategoryId,
      {
        id = soilCategoryId;
        name = "Soil & Fertilizers";
        description = "High quality soil and plant food";
      },
    );
    nextCategoryId += 1;

    // Add products
    products.add(
      nextProductId,
      {
        id = nextProductId;
        name = "Monstera Deliciosa";
        description = "Popular indoor plant with large, tropical leaves";
        categoryId = plantCategoryId;
        priceCents = 3999;
        stock = 10;
        active = true;
        gardenCenterId = 0;
        imageUrls = []; // Initialize with empty array
      },
    );
    nextProductId += 1;
  };
};
