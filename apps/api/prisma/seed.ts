import { url } from "inspector";
import { PrismaClient } from "../generated/prisma/index.js";
import { genSalt, hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.info("🌱 [SEED] Starting seed script");

  try {
    /* -------------------------------------------------------------------------- */
    /*                             DELETE EXISTING DATA                           */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Cleaning old data...");

    await prisma.address.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.storeProduct.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.image.deleteMany();
    await prisma.category.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();

    console.info("✅ Old data cleaned");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE USERS                                  */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating users...");

    const salt = await genSalt(10);

    const user1 = await prisma.user.create({
      data: {
        id: "2",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: await hash("secret123", salt),
        isVerified: true,
        username: "johndoe",
        role: "USER",
        Cart: {
          create: {},
        },
      },
    });

    const storeAdmin = await prisma.user.create({
      data: {
        id: "1",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@store.com",
        password: await hash("admin123", salt),
        isVerified: true,
        username: "alicestore",
        role: "STORE_ADMIN",
        Cart: {
          create: {},
        },
      },
    });

    const superAdmin = await prisma.user.create({
      data: {
        id: "3",
        firstName: "Bob",
        lastName: "Taylor",
        email: "bob@admin.com",
        password: await hash("superadmin123", salt),
        isVerified: true,
        username: "bobsuper",
        role: "SUPER_ADMIN",
        Cart: {
          create: {},
        },
      },
    });

    console.info("✅ Users created:");
    console.info(`- ${user1.email} (USER)`);
    console.info(`- ${storeAdmin.email} (STORE_ADMIN)`);
    console.info(`- ${superAdmin.email} (SUPER_ADMIN)`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE STORE                                  */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating store...");

    const store = await prisma.store.create({
      data: {
        name: "SuperMart",
        userId: superAdmin.id, // Super Admin creates the store
        address: "123 Main Street",
        city: "Metropolis",
        province: "Central Province",
        postalCode: "12345",
      },
    });

    console.info(`✅ Store created: ${store.name}`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE CATEGORY                               */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating categories...");

    const categoriesData = [
      { name: "Fruits", description: "Fresh fruits and farm produce." },
      { name: "Beverages", description: "Juices, water, and drinks." },
      {
        name: "Snacks",
        description: "Chips, instant noodles, and ready-to-eat snacks.",
      },
      { name: "Bakery", description: "Breads and baked goods." },
      {
        name: "Eggs & Dairy",
        description: "Milk, eggs, and other dairy products.",
      },
      { name: "Cheese", description: "High quality cheese products." },
    ];

    for (const category of categoriesData) {
      await prisma.category.create({
        data: {
          description: category.description,
          name: category.name,
        },
      });
    }

    console.log("Category seeding finished.");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE ADDRESSES                             */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating addresses...");

    await prisma.address.createMany({
      data: [
        {
          // John Doe
          street: "456 Elm Street",
          city: "Jakarta",
          state: "DKI Jakarta",
          postalCode: "10120",
          country: "Indonesia",
          userId: user1.id,
        },
        {
          // Alice Smith (store admin)
          street: "789 Pine Road",
          city: "Bandung",
          state: "West Java",
          postalCode: "40181",
          country: "Indonesia",
          userId: storeAdmin.id,
        },
        {
          // Bob Taylor (super admin)
          street: "123 Orchard Lane",
          city: "Surabaya",
          state: "East Java",
          postalCode: "60241",
          country: "Indonesia",
          userId: superAdmin.id,
        },
      ],
    });

    console.info("✅ 3 addresses created");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE PRODUCTS                               */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating products...");
    const productsData = [
      {
        name: "Apple Fuji",
        description: "Fresh Fuji apples from the farm.",
        stock: 100,
        price: 30000,
        weight: 0.2,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apple_yrplns.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apel_hqtnge.jpg",
          },
        ],
      },
      {
        name: "Orange Juice",
        description: "100% pure orange juice, no sugar added.",
        stock: 0,
        price: 25000,
        weight: 1,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751860741/orange_juice_zvtzor.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859790/orange_juice2_txetmj.jpg",
          },
        ],
      },
      {
        name: "Potato Chips",
        description: "Crispy salted potato chips.",
        stock: 50,
        price: 15000,
        weight: 0.1,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips_uhv1b8.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips2_mxjhhv.jpg",
          },
        ],
      },
      {
        name: "Banana Cavendish",
        description: "Sweet Cavendish bananas, ripe and ready to eat.",
        stock: 120,
        price: 20000,
        weight: 1,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/banana2_apja59.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859926/banana_eetanm.jpg",
          },
        ],
      },
      {
        name: "Milk 1L",
        description: "Fresh cow milk in 1 liter bottle.",
        stock: 40,
        price: 18000,
        weight: 1,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
          },
        ],
      },
      {
        name: "Brown Eggs 10pcs",
        description: "Organic brown eggs, pack of 10.",
        stock: 80,
        price: 22000,
        weight: 0.5,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
          },
        ],
      },
      {
        name: "Instant Noodles",
        description: "Spicy chicken flavored instant noodles.",
        stock: 300,
        price: 3500,
        weight: 0.08,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
          },
        ],
      },
      {
        name: "Cheddar Cheese 200g",
        description: "Premium quality cheddar cheese block.",
        stock: 30,
        price: 45000,
        weight: 0.2,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
          },
        ],
      },
      {
        name: "Whole Wheat Bread",
        description: "Soft and healthy whole wheat bread loaf.",
        stock: 60,
        price: 25000,
        weight: 0.5,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
          },
        ],
      },
      {
        name: "Mineral Water 600ml",
        description: "Clean and fresh bottled mineral water.",
        stock: 500,
        price: 4000,
        weight: 0.6,
        storeId: store.id,
        userId: "1",
      },
      {
        name: "Cheddar Cheese 200g",
        description: "Premium quality cheddar cheese block.",
        stock: 30,
        price: 45000,
        weight: 0.2,
        storeId: store.id,
        userId: "1",
        imagePreview: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751614925/water_wgkyiy.jpg",
          },
        ],
        imageContent: [
          {
            url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751615147/water_content_p6ouan.jpg",
          },
        ],
      },
    ];

    // for (const product of productsData) {
    //   try {
    //     const createdProduct = await prisma.product.create({
    //       data: {
    //         name: product.name,
    //         description: product.description,
    //         stock: product.stock,
    //         price: product.price,
    //         weight: product.weight,
    //         storeId: product.storeId,
    //         userId: product.userId,
    //         imagePreview: {
    //           create: product.imagePreview.map((img) => ({
    //             imageUrl: img.url,
    //           })),
    //         },
    //         imageContent: {
    //           create: product.imageContent.map((img) => ({
    //             imageUrl: img.url,
    //           })),
    //         },
    //       },
    //     });

    //     const productCollection = await prisma.product.findMany();
    //     const categoryCollection = await prisma.category.findMany();
    for (const product of productsData) {
      try {
        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            stock: product.stock,
            price: product.price,
            weight: product.weight,
            userId: product.userId,
            imagePreview: {
              create: product.imagePreview.map((img) => ({
                imageUrl: img.url,
              })),
            },
            imageContent: {
              create: product.imageContent.map((img) => ({
                imageUrl: img.url,
              })),
            },
          },
        });

        // Create ProductInventory for store
        await prisma.storeProduct.create({
          data: {
            productId: createdProduct.id,
            storeId: store.id,
            stock: product.stock,
          },
        });

        //     for (const el of productCollection) {
        //       const catRandomIndex = Math.round(
        //         Math.random() * (categoryCollection.length - 1)
        //       );

        //       await prisma.productCategory.create({
        //         data: {
        //           productId: el.id,
        //           categoryId: categoryCollection[catRandomIndex].id,
        //         },
        //       });
        //     }

        //     // Create ProductInventory for store
        //     await prisma.productInventory.create({
        //       data: {
        //         productId: createdProduct.id,
        //         storeId: store.id,
        //         stock: product.stock,
        //       },
        //     });

        console.info(`✅ Product created: ${createdProduct.name}`);
      } catch (productError) {
        console.error(
          `❌ Error creating product ${product.name}:`,
          productError
        );
      }
    }

    console.info("🌱 Seed completed successfully ✅");
  } catch (error) {
    console.error("❌ Error during seed:", error);
  } finally {
    await prisma.$disconnect();
    console.info("🔌 Prisma client disconnected");
  }
}

seed();
