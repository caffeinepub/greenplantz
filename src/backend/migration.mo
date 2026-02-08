import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type CategoryId = Nat;
  type ProductId = Nat;
  type OrderId = Nat;
  type GardenCenterId = Nat;

  type Category = {
    id : CategoryId;
    name : Text;
    description : Text;
  };

  type OrderItem = {
    productId : ProductId;
    quantity : Nat;
    pricePerItem : Nat;
  };

  type Order = {
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

  type UserProfile = {
    name : Text;
  };

  type TeamMember = {
    principal : Principal.Principal;
    enabled : Bool;
  };

  type GardenCenter = {
    id : Nat;
    name : Text;
    location : Text;
    teamMembers : List.List<TeamMember>;
    enabled : Bool;
    createdAt : Int;
  };

  type OldProduct = {
    id : ProductId;
    name : Text;
    description : Text;
    categoryId : CategoryId;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : GardenCenterId;
  };

  type NewProduct = {
    id : ProductId;
    name : Text;
    description : Text;
    categoryId : CategoryId;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : GardenCenterId;
    imageUrls : [Text]; // New imageUrls field
  };

  type OldActor = {
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextGardenCenterId : Nat;
    categories : Map.Map<CategoryId, Category>;
    products : Map.Map<ProductId, OldProduct>;
    orders : Map.Map<Principal.Principal, Map.Map<OrderId, Order>>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    gardenCenters : Map.Map<
      GardenCenterId,
      {
        id : Nat;
        name : Text;
        location : Text;
        teamMembers : List.List<TeamMember>;
        enabled : Bool;
        createdAt : Int;
      }
    >;
  };

  type NewActor = {
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextGardenCenterId : Nat;
    categories : Map.Map<CategoryId, Category>;
    products : Map.Map<ProductId, NewProduct>;
    orders : Map.Map<Principal.Principal, Map.Map<OrderId, Order>>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    gardenCenters : Map.Map<
      GardenCenterId,
      {
        id : Nat;
        name : Text;
        location : Text;
        teamMembers : List.List<TeamMember>;
        enabled : Bool;
        createdAt : Int;
      }
    >;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<ProductId, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        { oldProduct with imageUrls = [] };
      }
    );
    { old with products = newProducts };
  };
};
