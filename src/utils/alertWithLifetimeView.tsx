import { Alert, AlertColor } from "@mui/material"
import React from "react"

export interface AlertWithLifetimeViewProps {
    expirationDate: number
    severity: AlertColor
    message: string
}

interface AlertWithLifetimeViewState {
    interval: NodeJS.Timer
    percentageOfTimeLeft: number
}

export class AlertWithLifetimeView extends React.Component<AlertWithLifetimeViewProps, AlertWithLifetimeViewState> {

    constructor(props: AlertWithLifetimeViewProps) {
        super(props);
        const lifetimeInUnixSeconds = Date.now() + this.props.expirationDate;
        this.state = {
            percentageOfTimeLeft: 100,
            interval: setInterval(() => {
                const timeLeftInUnixSeconds = this.props.expirationDate - Date.now();
                const percentageOfTimeLeft = timeLeftInUnixSeconds / lifetimeInUnixSeconds;
                if (percentageOfTimeLeft <= 0) {
                    clearInterval(this.state.interval);
                }
                this.setState({ percentageOfTimeLeft });
            })
        };
    }

    render() {
        if (this.state.percentageOfTimeLeft <= 0) {
            return null;
        }
        // TODO: Render progress bar
        return <Alert severity={this.props.severity}>{this.props.message}</Alert>
    }
}