import React, { useState } from 'react';
import { BreedableNFT } from "nft-maker/typechain-types/contracts/BreedableNFT";
import { BigNumberish } from 'ethers';
import { Avatar, CircularProgress } from '@mui/material';

export interface CreaturePictureViewProps {
    contract: BreedableNFT
    tokenId: BigNumberish
}

export function CreaturePictureView(props: CreaturePictureViewProps) {
    const [picBase64, setPicBase64] = useState("");
    
    React.useEffect(() => {
        let isCancelled = false;
        fetch().then(src => {
            if (!isCancelled) {
                setPicBase64(src);
            }
        });
        return () => {
            isCancelled = true;
        }
    });

    async function fetch(): Promise<string> {
        return ""; // TODO
    }

    if (picBase64) {
        return <img
            src={`data:image/png;base64,${picBase64}`}
            alt={`Token ${props.tokenId} on contract ${props.contract.address}`}></img>
    } else {
        return <CircularProgress></CircularProgress>
    }
}