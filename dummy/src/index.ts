import { add } from "./utils/math";
import { greet } from "./services/hello";
import config from "./utils/config.json";

interface User {
  name: string;
  age: number;
}

console.log(config.port);
console.log(config.features);
console.log(config.database);

console.log(add(2, 3));
console.log(greet("GhostTS"));

const user: User = {
  name: "Aniket",
  age: 22,
};
console.log(user);
