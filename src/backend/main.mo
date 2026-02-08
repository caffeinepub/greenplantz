import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type CategoryId = Nat;
  public type ProductId = Nat;
  public type GardenCenterId = Nat;
  public type OrderId = Nat;

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

  public type Category = {
    id : CategoryId;
    name : Text;
    description : Text;
    parentCategoryId : ?CategoryId;
  };

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    categoryId : CategoryId;
    parentCategoryId : ?CategoryId;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : GardenCenterId;
    imageUrls : [Text];
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
    createdAt : Int;
    status : {
      #placed;
      #shipped;
      #delivered;
      #cancelled;
    };
  };

  public type CallerRole = {
    isPlatformAdmin : Bool;
    isCustomer : Bool;
    gardenCenterMemberships : [GardenCenterId];
  };

  public type CategoryWithSubcategories = {
    category : Category;
    subcategories : [CategoryWithSubcategories];
  };

  stable var initialized = false;

  var accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  stable var nextCategoryId = 0;
  stable var nextProductId = 0;
  stable var nextGardenCenterId = 0;

  let categories = Map.empty<CategoryId, Category>();
  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let gardenCenters = Map.empty<
    GardenCenterId,
    {
      id : Nat;
      name : Text;
      location : Text;
      teamMembers : List.List<TeamMember>;
      enabled : Bool;
      createdAt : Int;
    }
  >();
  let orders = Map.empty<Principal, Map.Map<OrderId, Order>>();

  func containsSearchTerm(haystack : Text, needle : Text) : Bool {
    let haystackChars = haystack.toArray();
    let needleChars = needle.toArray();
    let haystackLen = haystackChars.size();
    let needleLen = needleChars.size();

    if (needleLen == 0 or needleLen > haystackLen) { return false };

    if (haystackLen < needleLen) { return false };

    var i = 0;
    while (i <= (haystackLen - needleLen : Nat)) {
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

  public shared ({ caller }) func grantAdminAccess(userPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant admin access");
    };
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #admin);
  };

  public shared ({ caller }) func grantUserAccess(userPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant user access");
    };
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);
  };

  public shared ({ caller }) func revokeAccess(userPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke access");
    };
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #guest);
  };

  public query ({ caller }) func checkUserRole(userPrincipal : Principal) : async AccessControl.UserRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check user roles");
    };
    AccessControl.getUserRole(accessControlState, userPrincipal);
  };

  public query ({ caller }) func getCallerRole() : async CallerRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query role information");
    };
    {
      isPlatformAdmin = isPlatformAdmin(caller);
      isCustomer = AccessControl.hasPermission(accessControlState, caller, #user);
      gardenCenterMemberships = getGardenCenterMemberships(caller);
    };
  };

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

  public shared ({ caller }) func removeGardenCenter(gardenCenterId : GardenCenterId) : async () {
    assertPlatformAdmin(caller);

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let updatedGardenCenter = { gardenCenter with enabled = false };
        gardenCenters.add(gardenCenterId, updatedGardenCenter);
      };
    };
  };

  public shared ({ caller }) func updateGardenCenter(gardenCenterId : GardenCenterId, name : Text, location : Text) : async () {
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

  public shared ({ caller }) func addGardenCenterMember(gardenCenterId : GardenCenterId, memberPrincipal : Principal) : async () {
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

  public shared ({ caller }) func removeGardenCenterMember(gardenCenterId : GardenCenterId, memberPrincipal : Principal) : async () {
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

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getFullCategoryTaxonomy() : async [CategoryWithSubcategories] {
    let roots = List.empty<CategoryWithSubcategories>();

    for ((_, category) in categories.entries()) {
      switch (category.parentCategoryId) {
        case (null) {
          let tree = buildSubcategoryTree(category);
          roots.add(tree);
        };
        case (_) {};
      };
    };

    roots.toArray();
  };

  func buildSubcategoryTree(category : Category) : CategoryWithSubcategories {
    let filtered = categories.filter(
      func(_id, c) { c.parentCategoryId == ?category.id }
    );

    let subcategories = filtered.values().toArray().map(
      func(subcat) { buildSubcategoryTree(subcat) }
    );

    {
      category;
      subcategories;
    };
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

  public shared ({ caller }) func addCategory(name : Text, description : Text, parentCategoryId : ?CategoryId) : async CategoryId {
    assertPlatformAdmin(caller);

    switch (parentCategoryId) {
      case (null) {};
      case (?parentId) {
        switch (categories.get(parentId)) {
          case (null) { Runtime.trap("Parent category not found") };
          case (_) {};
        };
      };
    };

    let newCategory = {
      id = nextCategoryId;
      name;
      description;
      parentCategoryId;
    };

    categories.add(nextCategoryId, newCategory);
    nextCategoryId += 1;
    newCategory.id;
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    categoryId : CategoryId,
    priceCents : Nat,
    stock : Nat,
    gardenCenterId : GardenCenterId,
    imageUrls : [Text],
  ) : async ProductId {
    assertGardenCenterMember(gardenCenterId, caller);
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (_) {};
    };

    let parentCategoryId = switch (categories.get(categoryId)) {
      case (null) { null };
      case (?category) { category.parentCategoryId };
    };

    let newProduct = {
      id = nextProductId;
      name;
      description;
      categoryId;
      parentCategoryId;
      priceCents;
      stock;
      active = true;
      gardenCenterId;
      imageUrls;
    };

    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func initializeSeedData() : async () {
    assertPlatformAdmin(caller);

    categories.clear();
    products.clear();
    nextCategoryId := 0;
    nextProductId := 0;

    categories.add(0, {
      id = 0;
      name = "Uncategorized";
      description = "Uncategorized";
      parentCategoryId = null;
    });

    let plantsCategoryId = nextCategoryId;
    categories.add(plantsCategoryId, {
      id = plantsCategoryId;
      name = "Plants";
      description = "All types of plants";
      parentCategoryId = null;
    });
    nextCategoryId += 1;

    let seedsCategoryId = nextCategoryId;
    categories.add(seedsCategoryId, {
      id = seedsCategoryId;
      name = "Seeds";
      description = "Seed varieties";
      parentCategoryId = null;
    });
    nextCategoryId += 1;

    let potsCategoryId = nextCategoryId;
    categories.add(potsCategoryId, {
      id = potsCategoryId;
      name = "Pots";
      description = "Container pots for gardening";
      parentCategoryId = null;
    });
    nextCategoryId += 1;

    let fertilizerCategoryId = nextCategoryId;
    categories.add(fertilizerCategoryId, {
      id = fertilizerCategoryId;
      name = "Fertilizers";
      description = "Soil conditioners";
      parentCategoryId = null;
    });
    nextCategoryId += 1;

    let indoorPlantsCategoryId = nextCategoryId;
    categories.add(indoorPlantsCategoryId, {
      id = indoorPlantsCategoryId;
      name = "Indoor Plants";
      description = "Plants suited for indoors";
      parentCategoryId = ?plantsCategoryId;
    });
    nextCategoryId += 1;

    let outdoorPlantsCategoryId = nextCategoryId;
    categories.add(outdoorPlantsCategoryId, {
      id = outdoorPlantsCategoryId;
      name = "Outdoor Plants";
      description = "Plants suited for outdoors";
      parentCategoryId = ?plantsCategoryId;
    });
    nextCategoryId += 1;

    let ceramicPotsCategoryId = nextCategoryId;
    categories.add(ceramicPotsCategoryId, {
      id = ceramicPotsCategoryId;
      name = "Ceramic Pots";
      description = "Ceramic pots for planting";
      parentCategoryId = ?potsCategoryId;
    });
    nextCategoryId += 1;

    let plasticPotsCategoryId = nextCategoryId;
    categories.add(plasticPotsCategoryId, {
      id = plasticPotsCategoryId;
      name = "Plastic Pots";
      description = "Plastic pots for gardening";
      parentCategoryId = ?potsCategoryId;
    });
    nextCategoryId += 1;

    let fiberPotsCategoryId = nextCategoryId;
    categories.add(fiberPotsCategoryId, {
      id = fiberPotsCategoryId;
      name = "Fiber Pots";
      description = "Pots made from natural fibers";
      parentCategoryId = ?potsCategoryId;
    });
    nextCategoryId += 1;

    switch (categories.get(indoorPlantsCategoryId)) {
      case (null) { Runtime.trap("Indoor Plants category not found") };
      case (_) {
        let plantProduct : Product = {
          id = nextProductId;
          name = "Snake Plant";
          description = "Low maintenance indoor plant";
          categoryId = indoorPlantsCategoryId;
          parentCategoryId = ?indoorPlantsCategoryId;
          priceCents = 1999;
          stock = 20;
          active = true;
          gardenCenterId = 0;
          imageUrls = [];
        };
        products.add(nextProductId, plantProduct);
        nextProductId += 1;
      };
    };

    switch (categories.get(ceramicPotsCategoryId)) {
      case (null) { Runtime.trap("Ceramic Pots category not found") };
      case (_) {
        let potProduct : Product = {
          id = nextProductId;
          name = "Blue Ceramic Pot";
          description = "Decorative indoor planter";
          categoryId = ceramicPotsCategoryId;
          parentCategoryId = ?ceramicPotsCategoryId;
          priceCents = 899;
          stock = 30;
          active = true;
          gardenCenterId = 0;
          imageUrls = [];
        };
        products.add(nextProductId, potProduct);
        nextProductId += 1;
      };
    };

    let defaultProduct : Product = {
      id = nextProductId;
      name = "Mystery Plant";
      description = "You never know what you'll get";
      priceCents = 999;
      stock = 1;
      categoryId = 0;
      parentCategoryId = ?0;
      active = true;
      gardenCenterId = 0;
      imageUrls = [];
    };
    products.add(nextProductId, defaultProduct);
    nextProductId += 1;
  };
};
