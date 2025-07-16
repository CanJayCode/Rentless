"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
class MemStorage {
    constructor() {
        this.rooms = new Map();
        this.settings = {
            id: 1,
            baseRent: 3000,
            unitRate: 10,
        };
        this.currentRoomId = 1;
        this.initializeRooms();
    }
    initializeRooms() {
        const tenantNames = [
            "Raj Kumar", "Priya Sharma", "Ahmed Khan", "Maria Jose", "David Wong",
            "Lisa Chen", "James Miller", "Sarah Johnson", "Mike Davis", "Anna Wilson",
            "Robert Brown", "Emily Taylor", "Carlos Garcia", "Jessica Lee", "Thomas Clark", "Linda Martinez"
        ];
        for (let i = 1; i <= 16; i++) {
            const room = {
                id: i,
                roomNumber: `Room ${i.toString().padStart(2, '0')}`,
                tenantName: tenantNames[i - 1],
                monthlyData: {},
            };
            this.rooms.set(i, room);
        }
        this.currentRoomId = 17;
    }
    async getRooms() {
        return Array.from(this.rooms.values());
    }
    async getRoom(id) {
        return this.rooms.get(id);
    }
    async getRoomForMonth(id, month) {
        var _a, _b, _c;
        const room = this.rooms.get(id);
        if (!room)
            return undefined;
        const monthlyData = room.monthlyData || {};
        const currentMonthData = monthlyData[month];
        // If current month has no data, calculate carry-forward
        if (!currentMonthData) {
            const previousMonth = this.getPreviousMonth(month);
            const previousMonthData = monthlyData[previousMonth];
            if (previousMonthData) {
                const rentCarryForward = Math.max(0, (((_a = previousMonthData.rent) === null || _a === void 0 ? void 0 : _a.balance) || 0));
                const electricityCarryForward = Math.max(0, (((_b = previousMonthData.electricity) === null || _b === void 0 ? void 0 : _b.balance) || 0));
                // Create new month data with carry-forward
                const newMonthData = {
                    rent: {
                        amountDue: this.settings.baseRent + rentCarryForward,
                        amountPaid: 0,
                        balance: this.settings.baseRent + rentCarryForward,
                        carryForward: rentCarryForward,
                        carryForwardFrom: rentCarryForward > 0 ? this.formatMonthName(previousMonth) : undefined,
                        status: "pending",
                    },
                    electricity: {
                        previousReading: ((_c = previousMonthData.electricity) === null || _c === void 0 ? void 0 : _c.currentReading) || 0,
                        currentReading: 0,
                        unitsConsumed: 0,
                        amountDue: electricityCarryForward,
                        amountPaid: 0,
                        balance: electricityCarryForward,
                        carryForward: electricityCarryForward,
                        carryForwardFrom: electricityCarryForward > 0 ? this.formatMonthName(previousMonth) : undefined,
                        status: "pending",
                    },
                };
                // Update the room with carry-forward data
                monthlyData[month] = newMonthData;
                const updatedRoom = Object.assign(Object.assign({}, room), { monthlyData });
                this.rooms.set(id, updatedRoom);
                return updatedRoom;
            }
        }
        return room;
    }
    getPreviousMonth(month) {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        date.setMonth(date.getMonth() - 1);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    formatMonthName(month) {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    async createRoom(insertRoom) {
        const id = this.currentRoomId++;
        const room = Object.assign(Object.assign({}, insertRoom), { id, monthlyData: {} });
        this.rooms.set(id, room);
        return room;
    }
    async updateRoom(id, data) {
        const room = this.rooms.get(id);
        if (!room)
            return undefined;
        const updatedRoom = Object.assign(Object.assign({}, room), data);
        this.rooms.set(id, updatedRoom);
        return updatedRoom;
    }
    async updateRoomForMonth(roomId, month, data) {
        var _a, _b, _c, _d, _e, _f;
        const room = this.rooms.get(roomId);
        if (!room)
            return undefined;
        const monthlyData = room.monthlyData || {};
        const currentMonthData = monthlyData[month] || {};
        // Get existing carry-forward data or calculate it
        let rentCarryForward = ((_a = currentMonthData.rent) === null || _a === void 0 ? void 0 : _a.carryForward) || 0;
        let rentCarryForwardFrom = (_b = currentMonthData.rent) === null || _b === void 0 ? void 0 : _b.carryForwardFrom;
        let electricityCarryForward = ((_c = currentMonthData.electricity) === null || _c === void 0 ? void 0 : _c.carryForward) || 0;
        let electricityCarryForwardFrom = (_d = currentMonthData.electricity) === null || _d === void 0 ? void 0 : _d.carryForwardFrom;
        // If no existing data, check previous month for carry-forward
        if (!currentMonthData.rent && !currentMonthData.electricity) {
            const previousMonth = this.getPreviousMonth(month);
            const previousMonthData = monthlyData[previousMonth];
            if (previousMonthData) {
                rentCarryForward = Math.max(0, (((_e = previousMonthData.rent) === null || _e === void 0 ? void 0 : _e.balance) || 0));
                electricityCarryForward = Math.max(0, (((_f = previousMonthData.electricity) === null || _f === void 0 ? void 0 : _f.balance) || 0));
                if (rentCarryForward > 0) {
                    rentCarryForwardFrom = this.formatMonthName(previousMonth);
                }
                if (electricityCarryForward > 0) {
                    electricityCarryForwardFrom = this.formatMonthName(previousMonth);
                }
            }
        }
        // Calculate units consumed
        const unitsConsumed = Math.max(0, data.currentReading - data.previousReading);
        const electricityCurrentDue = unitsConsumed * this.settings.unitRate;
        const electricityTotalDue = electricityCurrentDue + electricityCarryForward;
        // Calculate total amounts due (including carry-forward)
        const rentTotalDue = this.settings.baseRent + rentCarryForward;
        // Calculate balances
        const rentBalance = rentTotalDue - data.rentPaid;
        const electricityBalance = electricityTotalDue - data.electricityPaid;
        // Determine statuses
        const rentStatus = data.rentPaid === 0 ? "pending" : data.rentPaid < rentTotalDue ? "partial" : "paid";
        const electricityStatus = data.electricityPaid >= electricityTotalDue ? "paid" : "pending";
        const updatedMonthData = Object.assign(Object.assign({}, currentMonthData), { rent: {
                amountDue: rentTotalDue,
                amountPaid: data.rentPaid,
                balance: rentBalance,
                carryForward: rentCarryForward,
                carryForwardFrom: rentCarryForwardFrom,
                date: data.rentDate,
                notes: data.rentNotes,
                status: rentStatus,
            }, electricity: {
                previousReading: data.previousReading,
                currentReading: data.currentReading,
                unitsConsumed,
                amountDue: electricityTotalDue,
                amountPaid: data.electricityPaid,
                balance: electricityBalance,
                carryForward: electricityCarryForward,
                carryForwardFrom: electricityCarryForwardFrom,
                date: data.electricityDate,
                notes: data.electricityNotes,
                status: electricityStatus,
            } });
        monthlyData[month] = updatedMonthData;
        const updatedRoom = Object.assign(Object.assign({}, room), { tenantName: data.tenantName, monthlyData });
        this.rooms.set(roomId, updatedRoom);
        return updatedRoom;
    }
    async getSettings() {
        return this.settings;
    }
    async updateSettings(newSettings) {
        this.settings = Object.assign(Object.assign({}, this.settings), newSettings);
        return this.settings;
    }
    async resetMonthData(month) {
        const roomEntries = Array.from(this.rooms.entries());
        for (const [id, room] of roomEntries) {
            const monthlyData = room.monthlyData || {};
            delete monthlyData[month];
            this.rooms.set(id, Object.assign(Object.assign({}, room), { monthlyData }));
        }
    }
    async resetAllData() {
        const roomEntries = Array.from(this.rooms.entries());
        for (const [id, room] of roomEntries) {
            this.rooms.set(id, Object.assign(Object.assign({}, room), { monthlyData: {} }));
        }
    }
}
exports.MemStorage = MemStorage;
const firestore_storage_1 = require("./firestore-storage");
// Function to create storage instance with error handling
function createStorage() {
    // Check if Firebase credentials are available
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        try {
            console.log('Firebase credentials found, attempting to use Firestore storage...');
            return new firestore_storage_1.FirestoreStorage();
        }
        catch (error) {
            console.error('Failed to initialize Firestore storage:', error);
            console.log('Falling back to in-memory storage');
            return new MemStorage();
        }
    }
    else {
        console.log('Firebase credentials not found, using in-memory storage');
        return new MemStorage();
    }
}
exports.storage = createStorage();
//# sourceMappingURL=storage.js.map