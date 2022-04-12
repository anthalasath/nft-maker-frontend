import { Grid, Stack } from '@mui/material';
import { Vector2Struct } from 'nft-maker/typechain-types/contracts/BreedableNFT';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';
import { UploadedFolder } from './uploadFolderForm';

export interface UploadedFolderViewProps {
    folder: UploadedFolder
}

export class UploadedFolderView extends React.Component<UploadedFolderViewProps, {}> {
    render() {
        return <div>{this.props.folder.category.name} X: {this.props.folder.category.position.x} Y: {this.props.folder.category.position.y} ({this.props.folder.files.length})</div>;
    }
}