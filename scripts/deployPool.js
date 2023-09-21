// npx hardhat run scripts/deployPool.js --network localhost

const WETHAddress = "0xf18774574148852771c2631d7d06E2A6c8b44fCA";
const factoryAddress = "0x9f62EE65a8395824Ee0821eF2Dc4C947a23F0f25";
const swapRouterAddress = "0x20BBE62B175134D21b10C157498b663F048672bA";
const nftDescriptorAddress = "0x3AeEBbEe7CE00B11cB202d6D0F38D696A3f4Ff8e";
const nonfungibleTokenPositionDescriptorAddress =
  "0xB2ff9d5e60d68A52cea3cd041b32f1390A880365";
const nonfungiblePositionMangerAddress =
  "0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe";

const parveshAddress = "0x8B64968F69E669faCc86FA3484FD946f1bBE7c91";
const payalAddress = "0x9A86494Ba45eE1f9EEed9cFC0894f6C5d13a1F0b";
const jiyanshiAddress = "0xC0340c0831Aa40A0791cF8C3Ab4287EB0a9705d8";

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("BigNumber.js");
bn.config({
  EXPONENTIAL_AT: 999999,
  DECIMAL_PLACES: 40,
});

const MAINNET_URL =
  "https://eth-mainnet.g.alchemy.com/v2/d_i2rx_Ia6GaI5sQPI3I7tXhCdwEfTxQ";

const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

const nonfungiblePositionmanager = new Contract(
  nonfungiblePositionMangerAddress,
  artifacts.NonfungiblePositionManager.abi,
  provider
);

const factory = new Contract(
  factoryAddress,
  artifacts.UniswapV3Factory.abi,
  provider
);

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();

  console.log(`Creating pool for ${token0} / ${token1}`);
  console.log("Creating pool...");
  const poolTx = await nonfungiblePositionmanager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });
  console.log("Pool created");
  console.log("Pool tx: ", poolTx);

  const poolAddress = await factory.connect(owner).getPool(token0, token1, fee);
  console.log(`Pool address is ${poolAddress}`);
  return poolAddress;
}

async function main() {
  const ppjPool = await deployPool(
    parveshAddress,
    payalAddress,
    500,
    encodePriceSqrt(1, 1)
  );

  console.log("ppjPool: ", ppjPool);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
