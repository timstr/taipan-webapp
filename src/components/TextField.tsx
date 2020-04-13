import * as React from "react";

interface Props {
    readonly onSubmit: (s: string) => void;
    readonly submitButton?: boolean;
    readonly placeHolder?: string;
    readonly isPassword?: boolean;
    readonly grabFocus?: boolean;
}

interface State {
    readonly value: string;
}

export class TextField extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { value: "" };
        this.inputRef = React.createRef();
    }

    private inputRef: React.Ref<HTMLInputElement>;

    private handleInput = (value: string) => {
        this.setState({ value });
    };

    render() {
        return (
            <form
                onSubmit={(e) => {
                    this.props.onSubmit(this.state.value);
                    e.preventDefault();
                    return false;
                }}
            >
                <input
                    type={this.props.isPassword ? "password" : "text"}
                    className="text-field"
                    ref={this.inputRef}
                    value={this.state.value}
                    onChange={(e) => this.handleInput(e.target.value)}
                    placeholder={this.props.placeHolder}
                    autoFocus={this.props.grabFocus}
                ></input>
                {this.props.submitButton ? (
                    <button type="submit">Submit</button>
                ) : null}
            </form>
        );
    }
}
