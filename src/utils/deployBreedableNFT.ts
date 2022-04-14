import { BreedableNFTDeployer } from "nft-maker/typechain-types";
import { getBreederContractAddress, getDeployerContractAddress } from "../constants";
import BreedableNFTDeployerArtifact from "nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import { Contract, Signer } from "ethers";
import { BreedableNFTConstructorArgsStruct } from "nft-maker/typechain-types/contracts/BreedableNFTDeployer";

export type DeployedContractResult = Error | string;


export async function deployBreedableNFT(args: BreedableNFTConstructorArgsStruct, signer: Signer): Promise<DeployedContractResult> {
    const network = await signer.provider?.getNetwork();
    if (!network) {
        return new Error("Could not get network");
    }
    const deployerContractAddress = getDeployerContractAddress(network);
    const deployer = new Contract(deployerContractAddress, BreedableNFTDeployerArtifact.abi, signer) as BreedableNFTDeployer;
    try {
        console.log(JSON.stringify(args, null, 1));
        const tx = await deployer.deploy(args);
        await tx.wait();
        const eventFilter = deployer.filters.BreedableNFTDeployed(null, await signer.getAddress());
        const latestBlockNumber = await signer.provider?.getBlockNumber();
        if (!latestBlockNumber) {
            return new Error("Deployment probably succeeded, but could not get latest block number");
        }
        // TODO: Edge case with multiple deployments within same transaction ?
        const events = await deployer.queryFilter(eventFilter, latestBlockNumber);
        const event = events[0];

        return event.args.contractAddress;
    } catch (err: any) {
        return new Error(err);
    }
}