"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "@/components/atmosphere";
import { toast } from "@/components/ui/toast";

const FAILURES: Record<string, string> = {
  denied: "Spotify authorization was denied. You can try again.",
  failed: "Spotify authorization failed. You can try again.",
};

export function AuthorizeScreen({ error }: { error?: string }) {
  const announced = useRef(false);

  useEffect(() => {
    if (!error || announced.current) return;
    const title = FAILURES[error];
    if (!title) return;
    announced.current = true;
    toast.add({ title, type: "error" });
  }, [error]);

  return (
    <Atmosphere>
      <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-12">
          <img
            src="/Bunchify_Typo_White.svg"
            alt="Bunchify"
            className="h-auto w-[min(36vw,210px)]"
          />
          <p className="font-heading max-w-[14ch] text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.05] font-bold tracking-tight">
            Your Spotify tops, made for Stories.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button
              nativeButton={false}
              render={<a href="/api/auth/login" />}
              className="h-11 px-7 text-base"
            >
              Connect Spotify
            </Button>
            <p className="max-w-[42ch] text-sm leading-snug text-white/50">
              Connects read-only to your Spotify tops. Revoke anytime in your{" "}
              <a
                className="text-white/75 underline underline-offset-2"
                href="https://www.spotify.com/account/apps/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Spotify account
              </a>
              . See Spotify’s{" "}
              <a
                className="text-white/75 underline underline-offset-2"
                href="https://www.spotify.com/legal/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </Atmosphere>
  );
}
