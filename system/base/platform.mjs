export class BasePlatform {
    constructor() {
        this.name = "Generic Platform";
        this.version = "1.0.0";
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
