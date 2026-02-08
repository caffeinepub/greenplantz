import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    active: boolean;
    imageUrls: Array<string>;
    name: string;
    gardenCenterId: GardenCenterId;
    description: string;
    stock: bigint;
    priceCents: bigint;
}
export type GardenCenterId = bigint;
export interface GardenCenter {
    id: bigint;
    name: string;
    createdAt: bigint;
    teamMembers: Array<TeamMember>;
    enabled: boolean;
    location: string;
}
export interface Category {
    id: CategoryId;
    name: string;
    description: string;
}
export interface CallerRole {
    gardenCenterMemberships: Array<GardenCenterId>;
    isCustomer: boolean;
    isPlatformAdmin: boolean;
}
export interface OrderItem {
    pricePerItem: bigint;
    productId: ProductId;
    quantity: bigint;
}
export interface TeamMember {
    principal: Principal;
    enabled: boolean;
}
export type ProductId = bigint;
export type CategoryId = bigint;
export type OrderId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<CategoryId>;
    addGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    addProduct(name: string, description: string, categoryId: CategoryId, priceCents: bigint, stock: bigint, gardenCenterId: GardenCenterId, imageUrls: Array<string>): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGardenCenter(name: string, location: string): Promise<GardenCenterId>;
    disableGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    enableGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    getActiveProducts(): Promise<Array<Product>>;
    getCallerRole(): Promise<CallerRole>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getGardenCenter(gardenCenterId: GardenCenterId): Promise<GardenCenter>;
    getGardenCenters(): Promise<Array<GardenCenter>>;
    getProduct(productId: ProductId): Promise<Product>;
    getProductsForCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getProductsForGardenCenter(gardenCenterId: GardenCenterId): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>): Promise<OrderId>;
    removeGardenCenter(gardenCenterId: GardenCenterId): Promise<void>;
    removeGardenCenterMember(gardenCenterId: GardenCenterId, memberPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    toggleProductActive(productId: ProductId, active: boolean): Promise<void>;
    updateGardenCenter(gardenCenterId: GardenCenterId, name: string, location: string): Promise<void>;
    updateProduct(productId: ProductId, name: string, description: string, categoryId: CategoryId, priceCents: bigint, stock: bigint, imageUrls: Array<string>): Promise<void>;
}
