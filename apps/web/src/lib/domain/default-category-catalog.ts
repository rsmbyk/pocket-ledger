/** Locked stock category catalog (Spec 123). Not Dexie rows. */

export type CategoryKind = 'income' | 'expense';

export type StockCategoryGroup = {
	id: string;
	name: string;
	kind: CategoryKind;
};

export type StockCategory = {
	id: string;
	name: string;
	kind: CategoryKind;
	groupId: string;
	icon: string;
};

export const STOCK_INCOME_GROUP_IDS = [
	"stock-group:work",
	"stock-group:business-creating",
	"stock-group:investing-cashback",
	"stock-group:property-assets",
	"stock-group:benefits-support",
	"stock-group:gifts-windfalls",
	"stock-group:care-land-other"
] as const;

export const STOCK_EXPENSE_GROUP_IDS = [
	"stock-group:home",
	"stock-group:utilities",
	"stock-group:food-drink",
	"stock-group:transport",
	"stock-group:health",
	"stock-group:insurance",
	"stock-group:personal",
	"stock-group:family-kids",
	"stock-group:pets",
	"stock-group:education-work",
	"stock-group:tech-subs",
	"stock-group:fun",
	"stock-group:travel",
	"stock-group:money-civic",
	"stock-group:giving-faith",
	"stock-group:legal-life",
	"stock-group:catch-all"
] as const;

export const STOCK_CATEGORY_GROUPS: readonly StockCategoryGroup[] = [
	{ id: "stock-group:work", name: "Work", kind: "income" },
	{ id: "stock-group:business-creating", name: "Business & creating", kind: "income" },
	{ id: "stock-group:investing-cashback", name: "Investing & cashback", kind: "income" },
	{ id: "stock-group:property-assets", name: "Property & assets", kind: "income" },
	{ id: "stock-group:benefits-support", name: "Benefits & support", kind: "income" },
	{ id: "stock-group:gifts-windfalls", name: "Gifts & windfalls", kind: "income" },
	{ id: "stock-group:care-land-other", name: "Care, land, other", kind: "income" },
	{ id: "stock-group:home", name: "Home", kind: "expense" },
	{ id: "stock-group:utilities", name: "Utilities", kind: "expense" },
	{ id: "stock-group:food-drink", name: "Food & drink", kind: "expense" },
	{ id: "stock-group:transport", name: "Transport", kind: "expense" },
	{ id: "stock-group:health", name: "Health", kind: "expense" },
	{ id: "stock-group:insurance", name: "Insurance", kind: "expense" },
	{ id: "stock-group:personal", name: "Personal", kind: "expense" },
	{ id: "stock-group:family-kids", name: "Family & kids", kind: "expense" },
	{ id: "stock-group:pets", name: "Pets", kind: "expense" },
	{ id: "stock-group:education-work", name: "Education & work", kind: "expense" },
	{ id: "stock-group:tech-subs", name: "Tech & subs", kind: "expense" },
	{ id: "stock-group:fun", name: "Fun", kind: "expense" },
	{ id: "stock-group:travel", name: "Travel", kind: "expense" },
	{ id: "stock-group:money-civic", name: "Money & civic", kind: "expense" },
	{ id: "stock-group:giving-faith", name: "Giving & faith", kind: "expense" },
	{ id: "stock-group:legal-life", name: "Legal & life", kind: "expense" },
	{ id: "stock-group:catch-all", name: "Catch-all", kind: "expense" }
];

export const STOCK_CATEGORIES: readonly StockCategory[] = [
	{ id: "stock:income:salary", name: "Salary", kind: "income", groupId: "stock-group:work", icon: "briefcase" },
	{ id: "stock:income:bonus", name: "Bonus", kind: "income", groupId: "stock-group:work", icon: "party-popper" },
	{ id: "stock:income:commission", name: "Commission", kind: "income", groupId: "stock-group:work", icon: "badge-percent" },
	{ id: "stock:income:tips", name: "Tips", kind: "income", groupId: "stock-group:work", icon: "hand-coins" },
	{ id: "stock:income:overtime", name: "Overtime", kind: "income", groupId: "stock-group:work", icon: "clock" },
	{ id: "stock:income:equity", name: "Equity", kind: "income", groupId: "stock-group:work", icon: "chart-candlestick" },
	{ id: "stock:income:severance", name: "Severance", kind: "income", groupId: "stock-group:work", icon: "door-open" },
	{ id: "stock:income:freelance", name: "Freelance", kind: "income", groupId: "stock-group:work", icon: "laptop" },
	{ id: "stock:income:military", name: "Military", kind: "income", groupId: "stock-group:work", icon: "shield" },
	{ id: "stock:income:business", name: "Business", kind: "income", groupId: "stock-group:business-creating", icon: "store" },
	{ id: "stock:income:products", name: "Products", kind: "income", groupId: "stock-group:business-creating", icon: "shopping-bag" },
	{ id: "stock:income:services", name: "Services", kind: "income", groupId: "stock-group:business-creating", icon: "handshake" },
	{ id: "stock:income:creator", name: "Creator", kind: "income", groupId: "stock-group:business-creating", icon: "clapperboard" },
	{ id: "stock:income:advertising", name: "Advertising", kind: "income", groupId: "stock-group:business-creating", icon: "megaphone" },
	{ id: "stock:income:royalties", name: "Royalties", kind: "income", groupId: "stock-group:business-creating", icon: "copyright" },
	{ id: "stock:income:fees", name: "Fees", kind: "income", groupId: "stock-group:business-creating", icon: "briefcase-business" },
	{ id: "stock:income:interest", name: "Interest", kind: "income", groupId: "stock-group:investing-cashback", icon: "coins" },
	{ id: "stock:income:dividends", name: "Dividends", kind: "income", groupId: "stock-group:investing-cashback", icon: "chart-pie" },
	{ id: "stock:income:gains", name: "Gains", kind: "income", groupId: "stock-group:investing-cashback", icon: "trending-up" },
	{ id: "stock:income:crypto", name: "Crypto", kind: "income", groupId: "stock-group:investing-cashback", icon: "bitcoin" },
	{ id: "stock:income:cashback", name: "Cashback", kind: "income", groupId: "stock-group:investing-cashback", icon: "refresh-cw" },
	{ id: "stock:income:referral", name: "Referral", kind: "income", groupId: "stock-group:investing-cashback", icon: "user-plus" },
	{ id: "stock:income:rent", name: "Rent", kind: "income", groupId: "stock-group:property-assets", icon: "key-round" },
	{ id: "stock:income:stays", name: "Stays", kind: "income", groupId: "stock-group:property-assets", icon: "hotel" },
	{ id: "stock:income:property", name: "Property", kind: "income", groupId: "stock-group:property-assets", icon: "house" },
	{ id: "stock:income:vehicles", name: "Vehicles", kind: "income", groupId: "stock-group:property-assets", icon: "car" },
	{ id: "stock:income:deposits", name: "Deposits", kind: "income", groupId: "stock-group:property-assets", icon: "key-square" },
	{ id: "stock:income:pension", name: "Pension", kind: "income", groupId: "stock-group:benefits-support", icon: "landmark" },
	{ id: "stock:income:benefits", name: "Benefits", kind: "income", groupId: "stock-group:benefits-support", icon: "id-card" },
	{ id: "stock:income:unemployment", name: "Unemployment", kind: "income", groupId: "stock-group:benefits-support", icon: "clipboard-list" },
	{ id: "stock:income:tax-refund", name: "Tax refund", kind: "income", groupId: "stock-group:benefits-support", icon: "file-input" },
	{ id: "stock:income:grants", name: "Grants", kind: "income", groupId: "stock-group:benefits-support", icon: "graduation-cap" },
	{ id: "stock:income:child-support", name: "Child support", kind: "income", groupId: "stock-group:benefits-support", icon: "baby" },
	{ id: "stock:income:alimony", name: "Alimony", kind: "income", groupId: "stock-group:benefits-support", icon: "heart-plus" },
	{ id: "stock:income:claims", name: "Claims", kind: "income", groupId: "stock-group:benefits-support", icon: "umbrella" },
	{ id: "stock:income:gifts", name: "Gifts", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "gift" },
	{ id: "stock:income:inheritance", name: "Inheritance", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "scroll-text" },
	{ id: "stock:income:settlements", name: "Settlements", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "scale" },
	{ id: "stock:income:prizes", name: "Prizes", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "trophy" },
	{ id: "stock:income:rebates", name: "Rebates", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "undo-2" },
	{ id: "stock:income:crowdfunding", name: "Crowdfunding", kind: "income", groupId: "stock-group:gifts-windfalls", icon: "heart-handshake" },
	{ id: "stock:income:teaching", name: "Teaching", kind: "income", groupId: "stock-group:care-land-other", icon: "book-open" },
	{ id: "stock:income:care", name: "Care", kind: "income", groupId: "stock-group:care-land-other", icon: "heart" },
	{ id: "stock:income:farming", name: "Farming", kind: "income", groupId: "stock-group:care-land-other", icon: "wheat" },
	{ id: "stock:income:energy", name: "Energy", kind: "income", groupId: "stock-group:care-land-other", icon: "sun" },
	{ id: "stock:income:other", name: "Other", kind: "income", groupId: "stock-group:care-land-other", icon: "circle-dot" },
	{ id: "stock:expense:rent", name: "Rent", kind: "expense", groupId: "stock-group:home", icon: "door-closed" },
	{ id: "stock:expense:mortgage", name: "Mortgage", kind: "expense", groupId: "stock-group:home", icon: "building" },
	{ id: "stock:expense:hoa", name: "HOA", kind: "expense", groupId: "stock-group:home", icon: "fence" },
	{ id: "stock:expense:property-tax", name: "Property tax", kind: "expense", groupId: "stock-group:home", icon: "file-spreadsheet" },
	{ id: "stock:expense:home-insurance", name: "Home insurance", kind: "expense", groupId: "stock-group:home", icon: "house-plug" },
	{ id: "stock:expense:maintenance", name: "Maintenance", kind: "expense", groupId: "stock-group:home", icon: "wrench" },
	{ id: "stock:expense:furniture", name: "Furniture", kind: "expense", groupId: "stock-group:home", icon: "sofa" },
	{ id: "stock:expense:cleaning", name: "Cleaning", kind: "expense", groupId: "stock-group:home", icon: "washing-machine" },
	{ id: "stock:expense:garden", name: "Garden", kind: "expense", groupId: "stock-group:home", icon: "trees" },
	{ id: "stock:expense:security", name: "Security", kind: "expense", groupId: "stock-group:home", icon: "cctv" },
	{ id: "stock:expense:moving", name: "Moving", kind: "expense", groupId: "stock-group:home", icon: "package-2" },
	{ id: "stock:expense:renovation", name: "Renovation", kind: "expense", groupId: "stock-group:home", icon: "paint-roller" },
	{ id: "stock:expense:electricity", name: "Electricity", kind: "expense", groupId: "stock-group:utilities", icon: "zap" },
	{ id: "stock:expense:gas", name: "Gas", kind: "expense", groupId: "stock-group:utilities", icon: "flame" },
	{ id: "stock:expense:water", name: "Water", kind: "expense", groupId: "stock-group:utilities", icon: "droplet" },
	{ id: "stock:expense:trash", name: "Trash", kind: "expense", groupId: "stock-group:utilities", icon: "trash-2" },
	{ id: "stock:expense:internet", name: "Internet", kind: "expense", groupId: "stock-group:utilities", icon: "wifi" },
	{ id: "stock:expense:mobile", name: "Mobile", kind: "expense", groupId: "stock-group:utilities", icon: "smartphone" },
	{ id: "stock:expense:cable", name: "Cable", kind: "expense", groupId: "stock-group:utilities", icon: "tv" },
	{ id: "stock:expense:groceries", name: "Groceries", kind: "expense", groupId: "stock-group:food-drink", icon: "shopping-basket" },
	{ id: "stock:expense:dining", name: "Dining", kind: "expense", groupId: "stock-group:food-drink", icon: "utensils" },
	{ id: "stock:expense:delivery", name: "Delivery", kind: "expense", groupId: "stock-group:food-drink", icon: "hand-platter" },
	{ id: "stock:expense:coffee", name: "Coffee", kind: "expense", groupId: "stock-group:food-drink", icon: "coffee" },
	{ id: "stock:expense:alcohol", name: "Alcohol", kind: "expense", groupId: "stock-group:food-drink", icon: "wine" },
	{ id: "stock:expense:snacks", name: "Snacks", kind: "expense", groupId: "stock-group:food-drink", icon: "cookie" },
	{ id: "stock:expense:fuel", name: "Fuel", kind: "expense", groupId: "stock-group:transport", icon: "fuel" },
	{ id: "stock:expense:transit", name: "Transit", kind: "expense", groupId: "stock-group:transport", icon: "bus" },
	{ id: "stock:expense:rideshare", name: "Rideshare", kind: "expense", groupId: "stock-group:transport", icon: "car-taxi-front" },
	{ id: "stock:expense:parking", name: "Parking", kind: "expense", groupId: "stock-group:transport", icon: "parking-meter" },
	{ id: "stock:expense:car-loan", name: "Car loan", kind: "expense", groupId: "stock-group:transport", icon: "wallet-cards" },
	{ id: "stock:expense:car-insurance", name: "Car insurance", kind: "expense", groupId: "stock-group:transport", icon: "car-front" },
	{ id: "stock:expense:registration", name: "Registration", kind: "expense", groupId: "stock-group:transport", icon: "file-output" },
	{ id: "stock:expense:servicing", name: "Servicing", kind: "expense", groupId: "stock-group:transport", icon: "cog" },
	{ id: "stock:expense:bike", name: "Bike", kind: "expense", groupId: "stock-group:transport", icon: "bike" },
	{ id: "stock:expense:fines", name: "Fines", kind: "expense", groupId: "stock-group:transport", icon: "octagon-alert" },
	{ id: "stock:expense:doctor", name: "Doctor", kind: "expense", groupId: "stock-group:health", icon: "stethoscope" },
	{ id: "stock:expense:dentist", name: "Dentist", kind: "expense", groupId: "stock-group:health", icon: "smile-plus" },
	{ id: "stock:expense:vision", name: "Vision", kind: "expense", groupId: "stock-group:health", icon: "glasses" },
	{ id: "stock:expense:pharmacy", name: "Pharmacy", kind: "expense", groupId: "stock-group:health", icon: "pill" },
	{ id: "stock:expense:hospital", name: "Hospital", kind: "expense", groupId: "stock-group:health", icon: "hospital" },
	{ id: "stock:expense:therapy", name: "Therapy", kind: "expense", groupId: "stock-group:health", icon: "brain" },
	{ id: "stock:expense:labs", name: "Labs", kind: "expense", groupId: "stock-group:health", icon: "flask-conical" },
	{ id: "stock:expense:pregnancy", name: "Pregnancy", kind: "expense", groupId: "stock-group:health", icon: "ribbon" },
	{ id: "stock:expense:health", name: "Health", kind: "expense", groupId: "stock-group:insurance", icon: "heart-pulse" },
	{ id: "stock:expense:life", name: "Life", kind: "expense", groupId: "stock-group:insurance", icon: "cross" },
	{ id: "stock:expense:travel", name: "Travel", kind: "expense", groupId: "stock-group:insurance", icon: "luggage" },
	{ id: "stock:expense:pet", name: "Pet", kind: "expense", groupId: "stock-group:insurance", icon: "dog" },
	{ id: "stock:expense:other", name: "Other", kind: "expense", groupId: "stock-group:insurance", icon: "shield-plus" },
	{ id: "stock:expense:clothing", name: "Clothing", kind: "expense", groupId: "stock-group:personal", icon: "shirt" },
	{ id: "stock:expense:grooming", name: "Grooming", kind: "expense", groupId: "stock-group:personal", icon: "scissors" },
	{ id: "stock:expense:toiletries", name: "Toiletries", kind: "expense", groupId: "stock-group:personal", icon: "bath" },
	{ id: "stock:expense:childcare", name: "Childcare", kind: "expense", groupId: "stock-group:family-kids", icon: "blocks" },
	{ id: "stock:expense:school", name: "School", kind: "expense", groupId: "stock-group:family-kids", icon: "school" },
	{ id: "stock:expense:activities", name: "Activities", kind: "expense", groupId: "stock-group:family-kids", icon: "toy-brick" },
	{ id: "stock:expense:child-support", name: "Child support", kind: "expense", groupId: "stock-group:family-kids", icon: "user-round" },
	{ id: "stock:expense:alimony", name: "Alimony", kind: "expense", groupId: "stock-group:family-kids", icon: "heart-crack" },
	{ id: "stock:expense:elder-care", name: "Elder care", kind: "expense", groupId: "stock-group:family-kids", icon: "user-cog" },
	{ id: "stock:expense:baby", name: "Baby", kind: "expense", groupId: "stock-group:family-kids", icon: "bean" },
	{ id: "stock:expense:food", name: "Food", kind: "expense", groupId: "stock-group:pets", icon: "bone" },
	{ id: "stock:expense:vet", name: "Vet", kind: "expense", groupId: "stock-group:pets", icon: "cat" },
	{ id: "stock:expense:care", name: "Care", kind: "expense", groupId: "stock-group:pets", icon: "paw-print" },
	{ id: "stock:expense:courses", name: "Courses", kind: "expense", groupId: "stock-group:education-work", icon: "book" },
	{ id: "stock:expense:student-loan", name: "Student loan", kind: "expense", groupId: "stock-group:education-work", icon: "university" },
	{ id: "stock:expense:office", name: "Office", kind: "expense", groupId: "stock-group:education-work", icon: "monitor" },
	{ id: "stock:expense:supplies", name: "Supplies", kind: "expense", groupId: "stock-group:education-work", icon: "paperclip" },
	{ id: "stock:expense:software", name: "Software", kind: "expense", groupId: "stock-group:education-work", icon: "app-window" },
	{ id: "stock:expense:hosting", name: "Hosting", kind: "expense", groupId: "stock-group:education-work", icon: "globe" },
	{ id: "stock:expense:gadgets", name: "Gadgets", kind: "expense", groupId: "stock-group:tech-subs", icon: "tablet" },
	{ id: "stock:expense:subscriptions", name: "Subscriptions", kind: "expense", groupId: "stock-group:tech-subs", icon: "infinity" },
	{ id: "stock:expense:cloud", name: "Cloud", kind: "expense", groupId: "stock-group:tech-subs", icon: "cloud" },
	{ id: "stock:expense:entertainment", name: "Entertainment", kind: "expense", groupId: "stock-group:fun", icon: "film" },
	{ id: "stock:expense:hobbies", name: "Hobbies", kind: "expense", groupId: "stock-group:fun", icon: "puzzle" },
	{ id: "stock:expense:sports", name: "Sports", kind: "expense", groupId: "stock-group:fun", icon: "dumbbell" },
	{ id: "stock:expense:gambling", name: "Gambling", kind: "expense", groupId: "stock-group:fun", icon: "dices" },
	{ id: "stock:expense:dating", name: "Dating", kind: "expense", groupId: "stock-group:fun", icon: "heart-minus" },
	{ id: "stock:expense:flights", name: "Flights", kind: "expense", groupId: "stock-group:travel", icon: "plane-takeoff" },
	{ id: "stock:expense:lodging", name: "Lodging", kind: "expense", groupId: "stock-group:travel", icon: "concierge-bell" },
	{ id: "stock:expense:local", name: "Local", kind: "expense", groupId: "stock-group:travel", icon: "map-pin" },
	{ id: "stock:expense:tours", name: "Tours", kind: "expense", groupId: "stock-group:travel", icon: "compass" },
	{ id: "stock:expense:visas", name: "Visas", kind: "expense", groupId: "stock-group:travel", icon: "earth-lock" },
	{ id: "stock:expense:fees", name: "Fees", kind: "expense", groupId: "stock-group:money-civic", icon: "vault" },
	{ id: "stock:expense:interest", name: "Interest", kind: "expense", groupId: "stock-group:money-civic", icon: "trending-down" },
	{ id: "stock:expense:taxes", name: "Taxes", kind: "expense", groupId: "stock-group:money-civic", icon: "calculator" },
	{ id: "stock:expense:retirement", name: "Retirement", kind: "expense", groupId: "stock-group:money-civic", icon: "piggy-bank" },
	{ id: "stock:expense:civic", name: "Civic", kind: "expense", groupId: "stock-group:money-civic", icon: "fingerprint-pattern" },
	{ id: "stock:expense:donation", name: "Donation", kind: "expense", groupId: "stock-group:giving-faith", icon: "hand-heart" },
	{ id: "stock:expense:offerings", name: "Offerings", kind: "expense", groupId: "stock-group:giving-faith", icon: "church" },
	{ id: "stock:expense:legal", name: "Legal", kind: "expense", groupId: "stock-group:legal-life", icon: "gavel" },
	{ id: "stock:expense:wedding", name: "Wedding", kind: "expense", groupId: "stock-group:legal-life", icon: "gem" },
	{ id: "stock:expense:funeral", name: "Funeral", kind: "expense", groupId: "stock-group:legal-life", icon: "flower" },
	{ id: "stock:expense:gifts", name: "Gifts", kind: "expense", groupId: "stock-group:legal-life", icon: "snowflake" },
	{ id: "stock:expense:tobacco", name: "Tobacco", kind: "expense", groupId: "stock-group:legal-life", icon: "cigarette" },
	{ id: "stock:expense:catch-all:other", name: "Other", kind: "expense", groupId: "stock-group:catch-all", icon: "shapes" }
];

const GROUPS_BY_ID = new Map(STOCK_CATEGORY_GROUPS.map((g) => [g.id, g]));
const CATS_BY_ID = new Map(STOCK_CATEGORIES.map((c) => [c.id, c]));

export const STOCK_UNCATEGORIZED_ICON = 'circle-dashed';
export const STOCK_CUSTOM_ICON = 'tag';
export const STOCK_ADMIN_FEE_ICON = 'percent';

export const STOCK_INCOME_CATCHALL_GROUP_ID = 'stock-group:care-land-other';
export const STOCK_EXPENSE_CATCHALL_GROUP_ID = 'stock-group:catch-all';

export function isStockCategoryId(id: string): boolean {
	return id.startsWith('stock:');
}

export function isStockGroupId(id: string): boolean {
	return id.startsWith('stock-group:');
}

export function stockGroupById(id: string): StockCategoryGroup | undefined {
	return GROUPS_BY_ID.get(id);
}

export function stockCategoryById(id: string): StockCategory | undefined {
	return CATS_BY_ID.get(id);
}

export function stockGroupsByKind(kind: CategoryKind): StockCategoryGroup[] {
	return STOCK_CATEGORY_GROUPS.filter((g) => g.kind === kind);
}

export function stockCategoriesByKind(kind: CategoryKind): StockCategory[] {
	return STOCK_CATEGORIES.filter((c) => c.kind === kind);
}

export function stockCategoriesInGroup(groupId: string): StockCategory[] {
	return STOCK_CATEGORIES.filter((c) => c.groupId === groupId);
}

export function catchAllGroupId(kind: CategoryKind): string {
	return kind === 'income' ? STOCK_INCOME_CATCHALL_GROUP_ID : STOCK_EXPENSE_CATCHALL_GROUP_ID;
}

/** First catalog row matching name+kind (case-insensitive). */
export function findStockCategoryByName(
	name: string,
	kind: CategoryKind
): StockCategory | undefined {
	const needle = name.trim().toLowerCase();
	return STOCK_CATEGORIES.find((c) => c.kind === kind && c.name.toLowerCase() === needle);
}

export function catalogNameTaken(name: string, kind: CategoryKind): boolean {
	return Boolean(findStockCategoryByName(name, kind));
}
