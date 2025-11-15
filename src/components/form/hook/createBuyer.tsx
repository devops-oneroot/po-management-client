import axios from "axios";

const genUserBuyer = async (
  data: any
): Promise<{ user: any; token: string } | null> => {
  try {
    console.log("🚀 Creating buyer user with data:", data);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/dashboard/signup`,
      data
    );
    console.log("Signup response:", res.data);

    // Handle existing user (aligned with createFarmer)
    if (res.status === 404 || res.data.status === 404) {
      console.log("👤 Buyer already exists, proceeding with existing account.");
      alert("User already exists, proceeding with existing account.");
      return null;
    }

    // Extract token and user data
    const token = res.data?.data?.accessToken;
    const user = res.data?.data?.user;

    if (!token || !user) {
      throw new Error("Signup did not return valid user data or token");
    }

    console.log("✅ Token received:", token.substring(0, 20) + "...");
    console.log("✅ User ID:", user.id);

    return { user, token };
  } catch (error: any) {
    console.error(
      "❌ Error in buyer signup:",
      error.response?.data || error.message
    );
    alert("Error while creating buyer account");
    throw error;
  }
};

const addPrice = async (
  priceData: any,
  token: string,
  userId: string
): Promise<void> => {
  if (!token) throw new Error("No valid token provided for price addition");
  if (!userId) throw new Error("No valid user ID provided for price addition");

  // Include token and userId in the request body (aligned with createFarmer's genFarm)
  const payload = {
    ...priceData,
    token,
    userId, // Include userId to associate price with buyer
  };

  try {
    console.log("📊 Sending price data:", {
      ...payload,
      token: token.substring(0, 20) + "...",
    });
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/dash-daily-price`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Price added for ${priceData.cropName}:`, res.data);
  } catch (error: any) {
    console.error(`❌ Error adding price for ${priceData.cropName}:`);
    console.error("Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);
    if (error.response?.status === 401) {
      console.error("🚨 Authentication failed - check if token is valid");
    }
    throw error;
  }
};

export const createBuyer = async (data: any) => {
  try {
    console.log("🚀 Starting buyer creation process...");

    // 1. Prepare buyer data (aligned with createFarmer)
    const buyerInfo = {
      name: data.name,
      village: data.village,
      mobileNumber: data.mobileNumber,
      taluk: data.taluk,
      district: data.district,
      language: "en",
      identity: "BUYER",
      fcmToken: data.fcmToken,
      deviceId: data.deviceId,
      pincode: data.pincode,
      state: data.state,
      cropNames: data.cropNames || [], // Ensure cropNames is an array of strings
    };

    // 2. Sign up buyer and get user data + token
    const userResult = await genUserBuyer(buyerInfo);

    // If user already existed, skip price addition
    if (userResult === null) {
      console.log("👤 Existing buyer detected, skipping price addition.");
      return { status: 200, message: "Existing buyer detected" };
    }

    const { user, token } = userResult;
    console.log("✅ Buyer signup completed for:", user.id);

    // 3. Add prices for all crops
    if (!data.cropNames || !data.cropNames.length) {
      throw new Error("No valid crop names provided for price addition");
    }

    // Assume data.prices is an array like [{ cropName, cropVariety, price }, ...]
    if (!data.prices || !data.prices.length) {
      throw new Error("No valid price data provided for crops");
    }

    console.log("📊 Adding prices for crops...");
    for (const priceData of data.prices) {
      // Validate that cropName in priceData matches one of the cropNames
      if (!buyerInfo.cropNames.includes(priceData.cropName)) {
        console.warn(
          `⚠️ Skipping price for ${priceData.cropName}: not in cropNames`
        );
        continue;
      }

      const payload = {
        cropName: priceData.cropName,
        cropVariety: priceData.cropVariety || "default", // Fallback to "default"
        price: Number(priceData.price),
      };

      await addPrice(payload, token, user.id);
    }
    console.log("✅ All prices added successfully");

    console.log("🎉 Buyer and prices added successfully!");
    return {
      status: 200,
      user,
      message: "Buyer and prices created successfully",
    };
  } catch (error: any) {
    console.error(
      "💥 Buyer creation process failed:",
      error.response?.data || error.message
    );
    alert("Something went wrong during the buyer creation process");
    throw error;
  }
};
