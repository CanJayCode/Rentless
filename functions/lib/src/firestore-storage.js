"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreStorage = void 0;
const firebase_1 = require("./firebase");
class FirestoreStorage {
    getFirestore() {
        const db = (0, firebase_1.getDb)();
        if (!db) {
            throw new Error('Firestore is not initialized. Please check your Firebase credentials.');
        }
        return db;
    }
    async initializeDefaultData() {
        const db = this.getFirestore();
        try {
            // Check if settings exist
            const settingsDoc = await db.collection(firebase_1.COLLECTIONS.SETTINGS).doc('default').get();
            if (!settingsDoc.exists) {
                // Create default settings
                await db.collection(firebase_1.COLLECTIONS.SETTINGS).doc('default').set({
                    id: 1,
                    baseRent: 3000,
                    unitRate: 10,
                });
            }
            // Check if rooms exist
            const roomsSnapshot = await db.collection(firebase_1.COLLECTIONS.ROOMS).get();
            if (roomsSnapshot.empty) {
                // Create default rooms
                const batch = db.batch();
                for (let i = 1; i <= 16; i++) {
                    const roomRef = db.collection(firebase_1.COLLECTIONS.ROOMS).doc(i.toString());
                    batch.set(roomRef, {
                        id: i,
                        roomNumber: `Room ${i.toString().padStart(2, '0')}`,
                        tenantName: `Tenant ${i}`,
                        monthlyData: {},
                    });
                }
                await batch.commit();
            }
        }
        catch (error) {
            console.error('Error initializing Firestore data:', error);
            throw new Error('Firestore database is not available. Please create the database first.');
        }
    }
    async getRooms() {
        try {
            const db = this.getFirestore();
            await this.initializeDefaultData();
            const snapshot = await db.collection(firebase_1.COLLECTIONS.ROOMS).orderBy('id').get();
            const rooms = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                rooms.push({
                    id: data.id,
                    roomNumber: data.roomNumber,
                    tenantName: data.tenantName,
                    monthlyData: data.monthlyData || {},
                });
            });
            return rooms;
        }
        catch (error) {
            console.error('Error fetching rooms from Firestore:', error);
            throw error;
        }
    }
    async getRoom(id) {
        const db = this.getFirestore();
        const doc = await db.collection(firebase_1.COLLECTIONS.ROOMS).doc(id.toString()).get();
        if (!doc.exists) {
            return undefined;
        }
        const data = doc.data();
        return {
            id: data.id,
            roomNumber: data.roomNumber,
            tenantName: data.tenantName,
            monthlyData: data.monthlyData || {},
        };
    }
    async getRoomForMonth(id, month) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const room = await this.getRoom(id);
        if (!room)
            return undefined;
        const settings = await this.getSettings();
        const monthlyData = room.monthlyData;
        const currentMonthData = monthlyData[month] || {};
        // Calculate carry-forward logic
        const previousMonth = this.getPreviousMonth(month);
        const previousMonthData = monthlyData[previousMonth];
        let rentCarryForward = 0;
        let electricityCarryForward = 0;
        let carryForwardFrom = '';
        if (previousMonthData && !((_a = currentMonthData.rent) === null || _a === void 0 ? void 0 : _a.amountPaid)) {
            const rentDue = settings.baseRent;
            const rentPaid = ((_b = previousMonthData.rent) === null || _b === void 0 ? void 0 : _b.amountPaid) || 0;
            const rentBalance = rentDue - rentPaid;
            if (rentBalance > 0) {
                rentCarryForward = rentBalance;
                carryForwardFrom = this.formatMonthName(previousMonth);
            }
        }
        if (previousMonthData && !((_c = currentMonthData.electricity) === null || _c === void 0 ? void 0 : _c.amountPaid)) {
            const unitsUsed = (((_d = previousMonthData.electricity) === null || _d === void 0 ? void 0 : _d.currentReading) || 0) -
                (((_e = previousMonthData.electricity) === null || _e === void 0 ? void 0 : _e.previousReading) || 0);
            const electricityDue = unitsUsed * settings.unitRate;
            const electricityPaid = ((_f = previousMonthData.electricity) === null || _f === void 0 ? void 0 : _f.amountPaid) || 0;
            const electricityBalance = electricityDue - electricityPaid;
            if (electricityBalance > 0) {
                electricityCarryForward = electricityBalance;
                if (!carryForwardFrom) {
                    carryForwardFrom = this.formatMonthName(previousMonth);
                }
            }
        }
        // Create updated room with carry-forward data
        const updatedRoom = Object.assign(Object.assign({}, room), { monthlyData: Object.assign(Object.assign({}, room.monthlyData), { [month]: Object.assign(Object.assign({}, currentMonthData), { rent: Object.assign(Object.assign({}, currentMonthData.rent), { carryForward: rentCarryForward, carryForwardFrom: carryForwardFrom }), electricity: Object.assign(Object.assign({}, currentMonthData.electricity), { carryForward: electricityCarryForward, carryForwardFrom: carryForwardFrom, previousReading: ((_g = currentMonthData.electricity) === null || _g === void 0 ? void 0 : _g.previousReading) ||
                            ((_h = previousMonthData === null || previousMonthData === void 0 ? void 0 : previousMonthData.electricity) === null || _h === void 0 ? void 0 : _h.currentReading) || 0 }) }) }) });
        return updatedRoom;
    }
    getPreviousMonth(month) {
        const date = new Date(month + '-01');
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().substring(0, 7);
    }
    formatMonthName(month) {
        const date = new Date(month + '-01');
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    async createRoom(insertRoom) {
        const db = this.getFirestore();
        // Get the next available ID
        const snapshot = await db.collection(firebase_1.COLLECTIONS.ROOMS).get();
        const maxId = snapshot.docs.reduce((max, doc) => {
            const data = doc.data();
            return Math.max(max, data.id || 0);
        }, 0);
        const newId = maxId + 1;
        const room = Object.assign(Object.assign({}, insertRoom), { id: newId, monthlyData: {} });
        await db.collection(firebase_1.COLLECTIONS.ROOMS).doc(newId.toString()).set(room);
        return room;
    }
    async updateRoom(id, data) {
        const db = this.getFirestore();
        const roomRef = db.collection(firebase_1.COLLECTIONS.ROOMS).doc(id.toString());
        const doc = await roomRef.get();
        if (!doc.exists) {
            return undefined;
        }
        await roomRef.update(data);
        const updatedDoc = await roomRef.get();
        const updatedData = updatedDoc.data();
        return {
            id: updatedData.id,
            roomNumber: updatedData.roomNumber,
            tenantName: updatedData.tenantName,
            monthlyData: updatedData.monthlyData || {},
        };
    }
    async updateRoomForMonth(roomId, month, data) {
        const db = this.getFirestore();
        const room = await this.getRoom(roomId);
        if (!room)
            return undefined;
        const monthlyData = room.monthlyData;
        const currentMonthData = monthlyData[month] || {};
        // Update the monthly data
        const updatedMonthData = Object.assign(Object.assign({}, currentMonthData), { rent: Object.assign(Object.assign({}, currentMonthData.rent), { amountPaid: data.rentPaid, date: data.rentDate, notes: data.rentNotes }), electricity: Object.assign(Object.assign({}, currentMonthData.electricity), { previousReading: data.previousReading, currentReading: data.currentReading, amountPaid: data.electricityPaid, date: data.electricityDate, notes: data.electricityNotes }) });
        const updatedRoom = Object.assign(Object.assign({}, room), { tenantName: data.tenantName, monthlyData: Object.assign(Object.assign({}, room.monthlyData), { [month]: updatedMonthData }) });
        await db.collection(firebase_1.COLLECTIONS.ROOMS).doc(roomId.toString()).set(updatedRoom);
        return updatedRoom;
    }
    async getSettings() {
        const db = this.getFirestore();
        await this.initializeDefaultData();
        const doc = await db.collection(firebase_1.COLLECTIONS.SETTINGS).doc('default').get();
        if (!doc.exists) {
            throw new Error('Settings not found');
        }
        const data = doc.data();
        return {
            id: data.id,
            baseRent: data.baseRent,
            unitRate: data.unitRate,
        };
    }
    async updateSettings(newSettings) {
        const db = this.getFirestore();
        const currentSettings = await this.getSettings();
        const updatedSettings = Object.assign(Object.assign({}, currentSettings), newSettings);
        await db.collection(firebase_1.COLLECTIONS.SETTINGS).doc('default').set(updatedSettings);
        return updatedSettings;
    }
    async resetMonthData(month) {
        const db = this.getFirestore();
        const rooms = await this.getRooms();
        const batch = db.batch();
        for (const room of rooms) {
            const monthlyData = room.monthlyData;
            if (monthlyData[month]) {
                delete monthlyData[month];
                const roomRef = db.collection(firebase_1.COLLECTIONS.ROOMS).doc(room.id.toString());
                batch.update(roomRef, { monthlyData });
            }
        }
        await batch.commit();
    }
    async resetAllData() {
        const db = this.getFirestore();
        const batch = db.batch();
        // Reset all rooms to default state
        for (let i = 1; i <= 16; i++) {
            const roomRef = db.collection(firebase_1.COLLECTIONS.ROOMS).doc(i.toString());
            batch.set(roomRef, {
                id: i,
                roomNumber: `Room ${i.toString().padStart(2, '0')}`,
                tenantName: `Tenant ${i}`,
                monthlyData: {},
            });
        }
        // Reset settings to default
        const settingsRef = db.collection(firebase_1.COLLECTIONS.SETTINGS).doc('default');
        batch.set(settingsRef, {
            id: 1,
            baseRent: 3000,
            unitRate: 10,
        });
        await batch.commit();
    }
}
exports.FirestoreStorage = FirestoreStorage;
//# sourceMappingURL=firestore-storage.js.map