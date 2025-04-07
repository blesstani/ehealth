class FacultyManager {
    constructor() {
        this.list = [];
    }

    add(path) {
        console.log(`Loading faculty from ${path}`);
        this.list.push(path);
    }
}

export class BasePlatform {
    constructor() {
        this.name = "Generic Platform";
        this.version = "1.0.0";
        this.faculties = new FacultyManager(); // ✅ This is key
    }

    getInfo() {
        return {
            name: this.name,
            version: this.version
        };
    }

    exit() {
        console.log("Shutting down system...");
        process.exit(1);
    }
}

export default new BasePlatform();
