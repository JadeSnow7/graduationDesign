import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

const INIT_LOCAL_MODEL_COMMAND = "plugin:eduedge-ai|init_local_model";
const STREAM_CHAT_COMMAND = "plugin:eduedge-ai|stream_chat";

/**
 * Supported backend names reported by the Rust plugin.
 */
export type BackendName = "CoreML" | "Metal" | "DirectML" | "Vulkan" | "CPU";

/**
 * Structured response returned by local model initialization.
 */
export interface InitResult {
  status: "success";
  backend: BackendName;
}

/**
 * Payload of `llm-token` events emitted by the Rust plugin.
 */
export interface LlmTokenPayload {
  streamId: string;
  token: string;
}

/**
 * Payload of `llm-finish` events emitted by the Rust plugin.
 */
export interface LlmFinishPayload {
  streamId: string;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === "string" ? error : "Unknown SDK error");
}

function createStreamId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `eduedge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * EduEdge AI SDK singleton facade for Tauri desktop runtime.
 */
export class EduEdgeAI {
  private static readonly instance = new EduEdgeAI();

  private constructor() {}

  /**
   * Returns the singleton instance.
   */
  static getInstance(): EduEdgeAI {
    return EduEdgeAI.instance;
  }

  /**
   * Initializes or reloads local model runtime in Rust plugin.
   *
   * @param modelPath Absolute or relative model path accepted by backend.
   * @returns Structured init result including selected backend name.
   * @throws Error when backend initialization fails.
   */
  static async init(modelPath: string): Promise<InitResult> {
    return EduEdgeAI.instance.initInternal(modelPath);
  }

  /**
   * Starts a streaming chat request and pushes each token to `onToken`.
   *
   * The method is concurrency-safe: each call uses an isolated `streamId`,
   * installs listeners before invoke, filters events by `streamId`, and
   * auto-cleans listeners on finish or failure.
   *
   * @param prompt User prompt to send to Rust local engine.
   * @param onToken Callback invoked for every streamed token.
   * @throws Error when invoke/listen fails.
   */
  static async streamChat(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    return EduEdgeAI.instance.streamChatInternal(prompt, onToken);
  }

  private async initInternal(modelPath: string): Promise<InitResult> {
    return invoke<InitResult>(INIT_LOCAL_MODEL_COMMAND, { modelPath });
  }

  private async streamChatInternal(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const streamId = createStreamId();
    let unlistenToken: UnlistenFn | null = null;
    let unlistenFinish: UnlistenFn | null = null;
    let settled = false;

    const cleanup = (): void => {
      if (unlistenToken) {
        unlistenToken();
        unlistenToken = null;
      }
      if (unlistenFinish) {
        unlistenFinish();
        unlistenFinish = null;
      }
    };

    return new Promise<void>(async (resolve, reject) => {
      const rejectOnce = (error: unknown): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        reject(toError(error));
      };

      const resolveOnce = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve();
      };

      try {
        unlistenToken = await listen<LlmTokenPayload>("llm-token", (event) => {
          const payload = event.payload;
          if (!payload || payload.streamId !== streamId) {
            return;
          }
          try {
            onToken(payload.token);
          } catch (error) {
            rejectOnce(error);
          }
        });

        unlistenFinish = await listen<LlmFinishPayload>(
          "llm-finish",
          (event) => {
            const payload = event.payload;
            if (!payload || payload.streamId !== streamId) {
              return;
            }
            resolveOnce();
          }
        );

        await invoke<void>(STREAM_CHAT_COMMAND, { prompt, streamId });
      } catch (error) {
        rejectOnce(error);
      }
    });
  }
}

/**
 * Exported singleton instance for direct SDK usage.
 */
export const eduEdgeAI = EduEdgeAI.getInstance();
