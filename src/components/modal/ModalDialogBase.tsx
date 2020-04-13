import * as React from "react";

interface ModalDialogBaseProps {
    readonly title: string;
    readonly children: React.ReactNode;
}

export const ModalDialogBase = (props: ModalDialogBaseProps) => (
    <div className="modal-dialog-backdrop">
        <div className="modal-dialog-center">
            <h3 className="modal-dialog-header">{props.title}</h3>
            <div className="modal-dialog-content">{props.children}</div>
        </div>
    </div>
);
