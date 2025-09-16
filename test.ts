function greet(name: string) {
  return "Hello " + name;
}

const msg: number = greet(42); // ❌ assigning string to number
console.log(msg);
