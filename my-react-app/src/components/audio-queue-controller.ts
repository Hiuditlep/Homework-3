export interface AudioTask {
  trackUrl: string;
  controller: AbortController;
  resolve: (buffer: AudioBuffer) => void;
  reject: (reason?: any) => void;
}

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeController: AbortController | null = null;
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }

  async enqueue(trackUrl: string): Promise<AudioBuffer> {
    // Kỹ thuật Concurrency control với AbortSignal
    const controller = new AbortController();
    return new Promise((resolve, reject) => {
      this.queue.push({ trackUrl, controller, resolve, reject });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift()!;
    this.activeController = task.controller;

    try {
      // Tải audio qua luồng mạng có hỗ trợ hủy (abort)
      const response = await fetch(task.trackUrl, {
        signal: task.controller.signal,
      });
      const arrayBuffer = await response.arrayBuffer();
      // Giải mã dữ liệu thành AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      task.resolve(audioBuffer);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeController = null;
      this.isProcessing = false;
      // Đệ quy gọi tiếp task sau trong hàng đợi (FIFO)
      this.processNext();
    }
  }

  // Dọn dẹp bộ nhớ khi cần thiết
  cleanup() {
    if (this.activeController) {
      this.activeController.abort();
    }
    this.queue.forEach((task) => task.controller.abort());
    this.queue = [];
    this.isProcessing = false;
  }

  get Context() {
    return this.audioContext;
  }
}

// Khởi tạo một instance duy nhất (Singleton) cho toàn app
export const audioQueue = new AudioTaskQueue();
