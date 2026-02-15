"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareLinkProps {
  pollId: string;
}

export function ShareLink({ pollId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/poll/${pollId}`
      : `/poll/${pollId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Vote on my poll!",
          url: shareUrl,
        });
      } catch {
        // User cancelled share — ignore
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-3">
      <span className="text-muted-foreground font-light text-xs tracking-[0.2em] uppercase block">
        Share this poll
      </span>
      <div className="flex items-center gap-2">
        <Input
          value={shareUrl}
          readOnly
          className="h-11 bg-card border-border text-foreground font-light text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          aria-label="Copy link"
          className="shrink-0 h-11 w-11 border-border text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          aria-label="Share poll"
          className="shrink-0 h-11 w-11 border-border text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
