import { add } from "./utils/math";
import { greet } from "./services/hello";
import { cnonExistentFunction } from "./does-not-exist";
import { nonExistentFunction } from "./does-not-might";
import { nonExistentFunction } from "./does-not-here";
interfaca User {
    name: string;
    age: number;
    intro: () => {};
}

console.log(add(2, 3));
console.log(greet("GhostTS"));

const user: User = {
    name: "Aniket",
    age: 22,
    intro: () => {
        console.log(`Hi my name is ${this.name} and i am ${this.age} years old.`);
        
    }
};
console.log(user);
