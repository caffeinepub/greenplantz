import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
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
    sku : Text;
    verified : Bool;
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

  public type FolderListing = {
    rootDirectories : [Text];
    backendDirectories : [Text];
    frontendDirectories : [Text];
    toolsDirectories : [Text];
    deploymentDirectories : [Text];
    documentationDirectories : [Text];
  };

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
  var accessControlState = AccessControl.initState();

  func bootstrapAdmins() {
    let adminPrincipals = [
      "b6cav-3sd7q-navb4-zf3yt-52cnf-gzonh-zab4f-rnkfa-fg42t-64thx-7qe",
      "7sopg-rkdvi-vg7tv-4foks-ejhyr-rotwu-wcdxm-kkij6-zwzel-qownx-aae",
      "robrk-rlmg7-56hiy-epen2-2jh4m-nqatd-jy2m5-dujk3-lsrep-yu33m-cqe",
      "2dvk3-yimfn-ghip2-q6c5t-ybd66-6ewxf-fn4nx-zdku7-5ke3s-u2wra-kqe",
    ];

    for (principalId in adminPrincipals.values()) {
      let principal = Principal.fromText(principalId);
      AccessControl.assignRole(accessControlState, principal, principal, #admin);
    };
  };

  //-------------------------------------
  // Folder Listing (Mock Implementation)
  //-------------------------------------

  public shared ({ caller }) func getParsedFolderListing() : async FolderListing {
    assertPlatformAdmin(caller);

    // This is a hardcoded mock for demo purposes.
    // Real implementation should be in a build tool or external script.
    {
      rootDirectories = [
        "root: /backend",
        "root: /frontend",
        "root: /tools",
        "root: /deployment",
        "root: /documentation"
      ];
      backendDirectories = [
        "backend: /authorization",
        "backend: /core",
        "backend: /utils"
      ];
      frontendDirectories = [
        "frontend: /components",
        "frontend: /pages",
        "frontend: /styles"
      ];
      toolsDirectories = [
        "tools: /scripts",
        "tools: /ci"
      ];
      deploymentDirectories = [
        "deployment: /dfx",
        "deployment: /docker"
      ];
      documentationDirectories = [
        "documentation: /docs"
      ];
    };
  };

  //-------------------------------------
  // Core Garden Center Functionality
  //-------------------------------------

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

    let gardenCenterId = gardenCenters.size();
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
    ensureDefaultCategoriesExist();
    categories.values().toArray();
  };

  public query ({ caller }) func getFullCategoryTaxonomy() : async [CategoryWithSubcategories] {
    ensureDefaultCategoriesExist();
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

  public query ({ caller }) func getGardenCenterById(gardenCenterId : GardenCenterId) : async GardenCenter {
    // Require authenticated user access
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view garden center details");
    };

    switch (gardenCenters.get(gardenCenterId)) {
      case (null) { Runtime.trap("Garden Center not found") };
      case (?gardenCenter) {
        let teamMembersArray = gardenCenter.teamMembers.toArray();

        // Verify caller is a member of this garden center
        switch (teamMembersArray.find(func(member) { member.principal == caller and member.enabled })) {
          case (null) {
            Runtime.trap("Access denied: You are not a member of this garden center");
          };
          case (?_) {
            if (not gardenCenter.enabled) {
              Runtime.trap("Garden Center is currently disabled");
            };
            return {
              id = gardenCenter.id;
              name = gardenCenter.name;
              location = gardenCenter.location;
              teamMembers = teamMembersArray;
              enabled = gardenCenter.enabled;
              createdAt = gardenCenter.createdAt;
            };
          };
        };
      };
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

    let categoryId = categories.size();
    let newCategory = {
      id = categoryId;
      name;
      description;
      parentCategoryId;
    };

    categories.add(categoryId, newCategory);
    categoryId;
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

    // Ensure default categories exist before validation
    ensureDefaultCategoriesExist();

    // Validate categoryId if not 0 (Uncategorized)
    if (categoryId != 0) {
      switch (categories.get(categoryId)) {
        case (null) { Runtime.trap("Category not found") };
        case (_) {};
      };
    };

    let parentCategoryId : ?CategoryId = if (categoryId != 0) {
      switch (categories.get(categoryId)) {
        case (null) { null };
        case (?category) { category.parentCategoryId };
      };
    } else {
      null;
    };

    let productId = products.size();
    let newSku = generateSku(name, gardenCenterId, productId);

    let newProduct : Product = {
      id = productId;
      name;
      description;
      categoryId;
      parentCategoryId;
      priceCents;
      stock;
      active = true;
      gardenCenterId;
      imageUrls;
      sku = newSku;
      verified = false; // Default to not verified (GreenPlantz verification required)
    };

    products.add(productId, newProduct);
    productId;
  };

  func generateSku(name : Text, gardenCenterId : GardenCenterId, productId : ProductId) : Text {
    // Take first 3 characters of name and convert to lowercase
    let nameFragment = convertToLower(
      Text.fromIter(name.chars().take(3))
    );
    let gcFragment = if (gardenCenterId < 1000) { gardenCenterId.toText() } else {
      (gardenCenterId % 1000).toText();
    };
    let productFragment = if (productId < 10000) { productId.toText() } else {
      (productId % 10000).toText();
    };

    nameFragment.concat(gcFragment).concat(productFragment);
  };

  public shared ({ caller }) func verifyProduct(productId : ProductId, verified : Bool) : async () {
    assertPlatformAdmin(caller);
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = { product with verified };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func updateProductStock(productId : ProductId, newStock : Nat) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        // Authorization: Must be garden center member or platform admin
        if (not isPlatformAdmin(caller) and not isGardenCenterMember(product.gardenCenterId, caller)) {
          Runtime.trap("Unauthorized: Can only update stock for products from your own garden center");
        };

        // Verification check: Product must be verified before stock updates
        if (not product.verified) {
          Runtime.trap("Stock update failed: Product must be verified by GreenPlantz team before updating stock quantity.");
        };

        let updatedProduct = { product with stock = newStock };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func initializeSeedData() : async () {
    assertPlatformAdmin(caller);

    addDefaultCategories();
    await addDemoProducts();
  };

  func addDefaultCategories() {
    ensureDefaultCategoriesExist();
  };

  func getCategoryIdByName(name : Text) : ?CategoryId {
    let normalizedName = normalizeCategoryName(name);

    let categoryNameToIdMap : [(Text, Nat)] = [
      ("uncategorized", 0),
      ("plants", 1),
      ("seeds", 2),
      ("pots", 3),
      ("fertilizer", 4),
      ("indoorplants", 5),
      ("outdoorplants", 6),
      ("ceramicpots", 7),
      ("plasticpots", 8),
      ("fiberpots", 9),
    ];

    switch (categoryNameToIdMap.find(func((catName, _)) { catName == normalizedName })) {
      case (?(catName, catId)) { ?catId };
      case (null) { null };
    };
  };

  func normalizeCategoryName(name : Text) : Text {
    let replacements = [
      (" ", ""),
      ("_", ""),
      ("/", ""),
      ("plants", "plants"),
      ("pots", "pots")
    ];

    let processedName = normalizeText(name, replacements);
    convertToLower(processedName);
  };

  func normalizeText(text : Text, replacements : [(Text, Text)]) : Text {
    var normalizedText = text;
    for ((from, to) in replacements.values()) {
      normalizedText := normalizedText.replace(#text from, to);
    };
    normalizedText;
  };

  func convertToLower(text : Text) : Text {
    let lowerText = text.toArray().map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
    Text.fromArray(lowerText);
  };

  func addDemoProducts() : async () {
    switch (getCategoryIdByName("indoorplants")) {
      case (null) { Runtime.trap("Indoor Plants category not found") };
      case (?indoorPlantsCategoryId) {
        switch (categories.get(indoorPlantsCategoryId)) {
          case (null) { Runtime.trap("Indoor Plants category not found") };
          case (_) {
            ignore await addProduct(
              "Snake Plant",
              "Low maintenance indoor plant",
              indoorPlantsCategoryId,
              1999,
              20,
              0,
              [],
            );
          };
        };
      };
    };

    switch (getCategoryIdByName("ceramicpots")) {
      case (null) { Runtime.trap("Ceramic Pots category not found") };
      case (?ceramicPotsCategoryId) {
        switch (categories.get(ceramicPotsCategoryId)) {
          case (null) { Runtime.trap("Ceramic Pots category not found") };
          case (_) {
            ignore await addProduct(
              "Blue Ceramic Pot",
              "Decorative indoor planter",
              ceramicPotsCategoryId,
              899,
              30,
              0,
              [],
            );
          };
        };
      };
    };

    let defaultProduct : Product = {
      id = 0;
      name = "Mystery Plant";
      description = "You never know what you'll get";
      priceCents = 999;
      stock = 1;
      categoryId = 0;
      parentCategoryId = ?0;
      active = true;
      gardenCenterId = 0;
      imageUrls = [];
      sku = "DEF000";
      verified = false;
    };
    products.add(0, defaultProduct);
  };

  public shared ({ caller }) func seedDefaultCategories() : async () {
    assertPlatformAdmin(caller);

    ensureDefaultCategoriesExist();
  };

  public query ({ caller }) func getCategoryByName(name : Text) : async ?Category {
    switch (getCategoryIdByName(name)) {
      case (null) { null };
      case (?catId) { categories.get(catId) };
    };
  };

  public query ({ caller }) func getCategoryPath(categoryId : CategoryId) : async [Category] {
    let path = List.empty<Category>();
    var currentCatId = ?categoryId;

    while (switch (currentCatId) { case (null) { false }; case (_) { true } }) {
      switch (currentCatId, categories.get(switch (currentCatId) { case (null) { 0 }; case (?id) { id } })) {
        case (?(catId), ?cat) {
          path.add(cat);
          currentCatId := cat.parentCategoryId;
        };
        case (_) { currentCatId := null };
      };
    };

    path.toArray();
  };

  public shared ({ caller }) func upsertProductStock(productId : ProductId, gardenCenterId : GardenCenterId, newStock : Nat) : async () {
    assertGardenCenterMember(gardenCenterId, caller);
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (product.gardenCenterId != gardenCenterId) {
          Runtime.trap("Product does not belong to this garden center");
        };
        let updatedProduct = { product with stock = newStock };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func bulkUpdateStocks(stockUpdates : [(ProductId, GardenCenterId, Nat)]) : async () {
    assertPlatformAdmin(caller);

    for ((productId, gardenCenterId, newStock) in stockUpdates.values()) {
      await upsertProductStock(productId, gardenCenterId, newStock);
    };
  };

  func ensureDefaultCategoriesExist() {
    if (categories.isEmpty()) {
      addCategoriesSequentially([
        ("Uncategorized", "Uncategorized", null),
        ("Plants", "All types of plants", null),
        ("Seeds", "Seed varieties", null),
        ("Pots", "Container pots for gardening", null),
        ("Fertilizers", "Soil conditioners", null),
        ("Indoor Plants", "Plants suited for indoors", ?1),
        ("Outdoor Plants", "Plants suited for outdoors", ?1),
        ("Ceramic Pots", "Ceramic pots for planting", ?3),
        ("Plastic Pots", "Plastic pots for gardening", ?3),
        ("Fiber Pots", "Pots made from natural fibers", ?3)
      ]);
    };
  };

  func addCategoriesSequentially(categoriesToAdd : [(Text, Text, ?Nat)]) {
    var localNextCategoryId = 0;
    for ((name, description, parentId) in categoriesToAdd.values()) {
      categories.add(
        localNextCategoryId,
        {
          id = localNextCategoryId;
          name;
          description;
          parentCategoryId = parentId;
        },
      );
      localNextCategoryId += 1;
    };
  };

  include MixinAuthorization(accessControlState);
};
