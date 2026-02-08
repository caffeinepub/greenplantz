import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type OldCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type NewCategory = {
    id : Nat;
    name : Text;
    description : Text;
    parentCategoryId : ?Nat;
  };

  type OldProduct = {
    id : Nat;
    name : Text;
    description : Text;
    categoryId : Nat;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : Nat;
    imageUrls : [Text];
  };

  type NewProduct = {
    id : Nat;
    name : Text;
    description : Text;
    categoryId : Nat;
    parentCategoryId : ?Nat;
    priceCents : Nat;
    stock : Nat;
    active : Bool;
    gardenCenterId : Nat;
    imageUrls : [Text];
  };

  type OldGardenCenter = {
    id : Nat;
    name : Text;
    location : Text;
    teamMembers : List.List<{ principal : Principal; enabled : Bool }>;
    enabled : Bool;
    createdAt : Int;
  };

  type OldActor = {
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextGardenCenterId : Nat;
    categories : Map.Map<Nat, OldCategory>;
    products : Map.Map<Nat, OldProduct>;
    gardenCenters : Map.Map<Nat, OldGardenCenter>;
  };

  type NewActor = {
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextGardenCenterId : Nat;
    categories : Map.Map<Nat, NewCategory>;
    products : Map.Map<Nat, NewProduct>;
    gardenCenters : Map.Map<Nat, OldGardenCenter>;
  };

  public func run(old : OldActor) : NewActor {
    let newCategories = old.categories.map<Nat, OldCategory, NewCategory>(
      func(_id, oldCategory) {
        { oldCategory with parentCategoryId = null };
      }
    );

    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          parentCategoryId = null;
        };
      }
    );

    {
      old with
      categories = newCategories;
      products = newProducts;
    };
  };
};
