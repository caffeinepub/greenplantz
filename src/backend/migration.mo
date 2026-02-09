import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "authorization/access-control";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type CategoryId = Nat;
  type ProductId = Nat;
  type GardenCenterId = Nat;
  type OrderId = Nat;

  type TeamMember = {
    principal : Principal;
    enabled : Bool;
  };

  type OldActor = {
    categories : Map.Map<CategoryId, { id : CategoryId; name : Text; description : Text; parentCategoryId : ?CategoryId }>;
    products : Map.Map<ProductId, { id : ProductId; name : Text; description : Text; categoryId : CategoryId; parentCategoryId : ?CategoryId; priceCents : Nat; stock : Nat; active : Bool; gardenCenterId : GardenCenterId; imageUrls : [Text] }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
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
    orders : Map.Map<Principal, Map.Map<OrderId, { id : OrderId; products : [{ productId : ProductId; quantity : Nat; pricePerItem : Nat }]; totalAmountCents : Nat; createdAt : Int; status : { #placed; #shipped; #delivered; #cancelled } }>>;
    accessControlState : AccessControl.AccessControlState;
    plantLists : Map.Map<Principal, { id : Nat; name : Text; description : Text; createdBy : Principal; plants : [Text] }>;
  };

  type NewActor = {
    categories : Map.Map<CategoryId, { id : CategoryId; name : Text; description : Text; parentCategoryId : ?CategoryId }>;
    products : Map.Map<ProductId, { id : ProductId; name : Text; description : Text; categoryId : CategoryId; parentCategoryId : ?CategoryId; priceCents : Nat; stock : Nat; active : Bool; gardenCenterId : GardenCenterId; imageUrls : [Text] }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
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
    orders : Map.Map<Principal, Map.Map<OrderId, { id : OrderId; products : [{ productId : ProductId; quantity : Nat; pricePerItem : Nat }]; totalAmountCents : Nat; createdAt : Int; status : { #placed; #shipped; #delivered; #cancelled } }>>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    { categories = old.categories; products = old.products; userProfiles = old.userProfiles; gardenCenters = old.gardenCenters; orders = old.orders; accessControlState = old.accessControlState };
  };
};
