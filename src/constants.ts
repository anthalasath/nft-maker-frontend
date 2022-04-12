import { ethers } from "ethers";
import Addresses from "nft-maker/tasks/addresses.json";

export function getBreederContractAddress(network: ethers.providers.Network): string {
    return getAddresses()[network.name].Breeder;
}

export function getDeployerContractAddress(network: ethers.providers.Network): string {
    return getAddresses()[network.name].BreedableNFTDeployer;
}

function getAddresses(): any {
    return Addresses;
}