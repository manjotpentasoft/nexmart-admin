export const COLLECTIONS = {
  BRANDS: "brands",
  CATEGORIES: "categories",
  CONTACT_MESSAGES: "contactMessages",
  CURRENCIES: "currencies",
  PRODUCTS: "products",
  TAXES: "taxes",
  USERS: "users",
};

export const SUBCOLLECTIONS = {
  SUBCATEGORIES: "subcategories",
  CART: "cart",
  WISHLIST: "wishlist",
  ORDERS: "orders",
};

export const USER_FIELDS = {
  ID: "id",
  NAME: "name",
  FIRSTNAME: "firstName",
  LASTNAME: "lastName",
  EMAIL: "email",
  PHONE: "phone",
  IMAGE: "image",
  DOB: "dob",
  ADDRESS: "address",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const PRODUCT_FIELDS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  BRAND: "brand",
  CATEGORY: "category",
  SUB_CATEGORY: "subCategory",
  PRODUCT_TYPE: "productType",
  PRICE: "price",
  PREVIOUS_PRICE: "previousPrice",
  STOCK: "stock",
  COLOR: "color",
  SIZE: "size",
  WEIGHT: "weight",
  IMAGE: "image",
  GALLERY_IMAGES: "galleryImages",
  SHORT_DESCRIPTION: "shortDescription",
  LONG_DESCRIPTION: "longDescription",
  SPECIFICATIONS: "specifications",
  TAGS: "tags",
  RATING: "rating",
  REVIEWS_COUNT: "reviewsCount",
  SALES_COUNT: "salesCount",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const CATEGORY_FIELDS = {
  ID: "id",
  NAME: "name",
  IMAGE: "image",
  ITEMS: "items",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const SUBCATEGORY_FIELDS = {
  ID: "id",
  CATEGORY_ID: "categoryId",
  NAME: "name",
  IMAGE: "image",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const BRAND_FIELDS = {
  ID: "id",
  NAME: "name",
  LOGO: "logo",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const ORDER_FIELDS = {
  ID: "id",
  BILLING: "billing",
  FIRSTNAME: "firstName",
  LASTNAME: "lastName",
  EMAIL: "email",
  PHONE: "phone",
  ADDRESS: "address",
  CITY: "city",
  COUNTRY: "country",
  POSTCODE: "postcode",
  PRODUCTS: "products",
  SHIPPING: "shipping",
  SUBTOTAL: "subtotal",
  TOTAL: "total",
  PAYMENT_METHOD: "paymentMethod",
  STATUS: "status",
  CREATED_AT: "createdAt",
};

export const CART_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  PRODUCTS: "products",
  ADDED_AT: "addedAt",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const WISHLIST_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  PRODUCTS: "products",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const REVIEW_FIELDS = {
  PRODUCT_ID: "productId",
  USER_ID: "userId",
  RATING: "rating",
  COMMENT: "comment",
  CREATED_AT: "createdAt",
};

export const CONTACT_MESSAGE_FIELDS = {
  ID: "id",
  NAME: "name",
  EMAIL: "email",
  SUBJECT: "subject",
  PHONE: "phone",
  MESSAGE: "message",
  CREATED_AT: "createdAt",
};

export const CURRENCY_FIELDS = {
  ID: "id",
  NAME: "name",
  SIGN: "sign",
  VALUE: "value",
  IS_DEFAULT: "isDefault",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const TAX_FIELDS = {
  ID: "id",
  NAME: "name",
  RATE: "rate",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

const FIREBASE_SCHEMA = {
  COLLECTIONS,
  SUBCOLLECTIONS,
  USER_FIELDS,
  PRODUCT_FIELDS,
  CATEGORY_FIELDS,
  SUBCATEGORY_FIELDS,
  BRAND_FIELDS,
  ORDER_FIELDS,
  CART_FIELDS,
  WISHLIST_FIELDS,
  REVIEW_FIELDS,
  CONTACT_MESSAGE_FIELDS,
  CURRENCY_FIELDS,
  TAX_FIELDS,
};

export default FIREBASE_SCHEMA;
