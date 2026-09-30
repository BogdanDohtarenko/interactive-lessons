const { Logtail } = require("@logtail/node");

const logtail = new Logtail("3PaGQJf7kB9BJ4J2nEQxHbAX", {
  endpoint: "https://s2778457.us-west-2a.betterstackdata.com"
});

async function run() {
  console.log("Отправка тестового лога...");
  try {
    await logtail.info("Test log from standalone script");
    await logtail.flush();
    console.log("Успешно отправлено!");
  } catch (error) {
    console.error("Ошибка при отправке:", error);
  }
}

run();