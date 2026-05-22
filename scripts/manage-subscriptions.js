/**
 * Dawrak Admin Subscription Manager CLI
 * Usage: node scripts/manage-subscriptions.js
 */

const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const cyan = "\x1b[36m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function listShops() {
  console.log(`\n${bold}${cyan}--- REGISTERED SHOPS ---${reset}`);
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" }
  });

  if (shops.length === 0) {
    console.log(`${yellow}No shops found in the database.${reset}`);
    return;
  }

  shops.forEach((shop, index) => {
    let statusColor = green;
    if (shop.subscriptionStatus === "EXPIRED") statusColor = red;
    else if (shop.subscriptionStatus === "TRIAL") statusColor = yellow;

    const trialEndStr = new Date(shop.trialEndsAt).toLocaleDateString();
    const subEndStr = shop.subscriptionEndsAt 
      ? new Date(shop.subscriptionEndsAt).toLocaleDateString()
      : "N/A";

    console.log(
      `[${index + 1}] ${bold}${shop.name}${reset} (${shop.slug})` +
      `\n    Status: ${statusColor}${shop.subscriptionStatus}${reset}` +
      ` | Trial Ends: ${yellow}${trialEndStr}${reset}` +
      ` | Sub Ends: ${green}${subEndStr}${reset}`
    );
  });
  console.log(`${cyan}------------------------${reset}\n`);
  return shops;
}

async function activateSubscription() {
  const shops = await listShops();
  if (!shops || shops.length === 0) return;

  const choiceStr = await question(`Select a shop number to activate (1-${shops.length}) or enter 'c' to cancel: `);
  if (choiceStr.toLowerCase() === "c") return;

  const index = parseInt(choiceStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= shops.length) {
    console.log(`${red}Invalid selection.${reset}`);
    return;
  }

  const shop = shops[index];
  console.log(`\nActivating subscription for: ${bold}${shop.name}${reset}`);
  console.log(`[1] Monthly Plan (30 Days)`);
  console.log(`[2] Annual Plan (365 Days)`);
  console.log(`[3] Custom Days`);
  
  const planChoice = await question(`Choose option (1-3): `);
  let days = 30;

  if (planChoice === "2") {
    days = 365;
  } else if (planChoice === "3") {
    const daysStr = await question(`Enter number of days: `);
    days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) {
      console.log(`${red}Invalid days. Defaulting to 30 days.${reset}`);
      days = 30;
    }
  } else if (planChoice !== "1") {
    console.log(`${yellow}Invalid choice. Defaulting to Monthly Plan (30 days).${reset}`);
  }

  const subscriptionEndsAt = new Date();
  subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + days);

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionEndsAt
    }
  });

  console.log(`\n${green}${bold}SUCCESS!${reset} Shop "${shop.name}" has been activated.`);
  console.log(`Subscription ends on: ${bold}${subscriptionEndsAt.toLocaleString()}${reset}\n`);
}

async function expireSubscription() {
  const shops = await listShops();
  if (!shops || shops.length === 0) return;

  const choiceStr = await question(`Select a shop number to suspend/expire (1-${shops.length}) or 'c' to cancel: `);
  if (choiceStr.toLowerCase() === "c") return;

  const index = parseInt(choiceStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= shops.length) {
    console.log(`${red}Invalid selection.${reset}`);
    return;
  }

  const shop = shops[index];
  
  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      subscriptionStatus: "EXPIRED",
      subscriptionEndsAt: new Date(0) // Set expired
    }
  });

  console.log(`\n${red}${bold}SUSPENDED!${reset} Shop "${shop.name}" subscription has been set to EXPIRED.\n`);
}

async function resetToTrial() {
  const shops = await listShops();
  if (!shops || shops.length === 0) return;

  const choiceStr = await question(`Select a shop number to reset to trial (1-${shops.length}) or 'c' to cancel: `);
  if (choiceStr.toLowerCase() === "c") return;

  const index = parseInt(choiceStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= shops.length) {
    console.log(`${red}Invalid selection.${reset}`);
    return;
  }

  const shop = shops[index];
  const daysStr = await question(`Enter trial duration in days (default is 14): `);
  let days = parseInt(daysStr, 10);
  if (isNaN(days) || days <= 0) days = 14;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + days);

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      subscriptionStatus: "TRIAL",
      trialEndsAt,
      subscriptionEndsAt: null
    }
  });

  console.log(`\n${green}${bold}SUCCESS!${reset} Shop "${shop.name}" reset to TRIAL.`);
  console.log(`Trial ends on: ${bold}${trialEndsAt.toLocaleString()}${reset}\n`);
}

async function main() {
  console.log(`
=============================================
     ${bold}${cyan}دَوْرَك - SUBSCRIPTION MANAGER CLI${reset}
=============================================
  `);

  let exit = false;
  while (!exit) {
    console.log(`${bold}Main Menu:${reset}`);
    console.log(`[1] List All Registered Shops`);
    console.log(`[2] Activate Shop Subscription (Paid)`);
    console.log(`[3] Suspend/Expire Shop Subscription`);
    console.log(`[4] Reset Shop to Free Trial`);
    console.log(`[5] Exit`);

    const choice = await question(`Enter your choice (1-5): `);

    try {
      switch (choice) {
        case "1":
          await listShops();
          break;
        case "2":
          await activateSubscription();
          break;
        case "3":
          await expireSubscription();
          break;
        case "4":
          await resetToTrial();
          break;
        case "5":
          exit = true;
          break;
        default:
          console.log(`${red}Invalid choice, please try again.${reset}\n`);
      }
    } catch (err) {
      console.error(`${red}Error executing action:${reset}`, err.message);
    }
  }

  rl.close();
  await prisma.$disconnect();
  console.log(`\n${cyan}Goodbye! Thank you for managing Dawrak.${reset}\n`);
}

main().catch(async (e) => {
  console.error(e);
  rl.close();
  await prisma.$disconnect();
  process.exit(1);
});
