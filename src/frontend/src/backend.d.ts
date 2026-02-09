import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type GardenCenterId = bigint;
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    active: boolean;
    imageUrls: Array<string>;
    name: string;
    gardenCenterId: GardenCenterId;
    description: string;
    parentCategoryId?: CategoryId;
    stock: bigint;
    priceCents: bigint;
}
export interface Category {
    id: CategoryId;
    name: string;
    description: string;
    parentCategoryId?: CategoryId;
}
export interface CallerRole {
    gardenCenterMemberships: Array<GardenCenterId>;
    isCustomer: boolean;
    isPlatformAdmin: boolean;
}
export interface FolderListing {
    rootDirectories: Array<string>;
    documentationDirectories: Array<string>;
    toolsDirectories: Array<string>;
    backendDirectories: Array<string>;
    frontendDirectories: Array<string>;
    deploymentDirectories: Array<string>;
}
export type CategoryId = bigint;
export type ProductId = bigint;
export interface CategoryWithSubcategories {
    category: Category;
    subcategories: Array<CategoryWithSubcategories>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string, description: string, parentCategoryId: CategoryId | null): Promise<CategoryId>;
    addGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    addProduct(name: string, description: string, categoryId: CategoryId, priceCents: bigint, stock: bigint, gardenCenterId: GardenCenterId, imageUrls: Array<string>): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUpdateStocks(stockUpdates: Array<[ProductId, GardenCenterId, bigint]>): Promise<void>;
    checkUserRole(userPrincipal: Principal): Promise<UserRole>;
    createGardenCenter(name: string, location: string): Promise<GardenCenterId>;
    getActiveProducts(): Promise<Array<Product>>;
    getCallerRole(): Promise<CallerRole>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getCategoryByName(name: string): Promise<Category | null>;
    getCategoryPath(categoryId: CategoryId): Promise<Array<Category>>;
    getFullCategoryTaxonomy(): Promise<Array<CategoryWithSubcategories>>;
    getParsedFolderListing(): Promise<FolderListing>;
    getProduct(productId: ProductId): Promise<Product>;
    getProductsForCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminAccess(userPrincipal: Principal): Promise<void>;
    grantUserAccess(userPrincipal: Principal): Promise<void>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeGardenCenter(gardenCenterId: GardenCenterId): Promise<void>;
    removeGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    revokeAccess(userPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDefaultCategories(): Promise<void>;
    updateGardenCenter(gardenCenterId: GardenCenterId, name: string, location: string): Promise<void>;
    upsertProductStock(productId: ProductId, gardenCenterId: GardenCenterId, newStock: bigint): Promise<void>;
}
