const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let i = 0;

export const showSpinner = () => {
  return setInterval(() => {
    process.stdout.write(`\r${spinner[i++ % spinner.length]} Restarting...`);
  }, 100);
};
