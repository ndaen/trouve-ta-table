import {useState} from "react";
import {Check, Copy} from "lucide-react";

interface CopyButtonProps {
    textToCopy: string;
}

export const CopyButton = ({textToCopy}: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => console.error('Failed to copy: ', err));
    };

    return (
        <button
            onClick={handleCopy}
            className={`btn text-foreground bg-transparent`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copied ? (
                <Check size={16} />
            ) : (
                <Copy size={16} />
            )
            }
        </button>
    );
}