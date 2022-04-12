import { Grid, Stack } from '@mui/material';
import { Vector2Struct } from 'nft-maker/typechain-types/contracts/BreedableNFT';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';

export interface UploadedFolderViewProps {
    folder: PicturePartCategoryStruct
}

export class UploadedFolderView extends React.Component<UploadedFolderViewProps, {}> {
    render() {
        return <Stack direction="row">
            <p>{this.props.folder.name}</p>
            <p>X: {this.props.folder.position.x}</p>
            <p>Y: {this.props.folder.position.y}</p>
        </Stack>
    }
}