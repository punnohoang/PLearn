import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.XAI_API_KEY, // thêm vào .env Render sau
            baseURL: 'https://api.x.ai/v1',
        });
    }

    async askQuestion(question: string, context: string) {
        const response = await this.openai.chat.completions.create({
            model: 'grok-beta',
            messages: [
                { role: 'system', content: 'Bạn là trợ lý học tập PLearn. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn.' },
                { role: 'user', content: `Ngữ cảnh: ${context}\nCâu hỏi: ${question}` },
            ],
        });
        return response.choices[0].message.content;
    }
}