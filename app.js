import "dotenv/config"
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

console.log(process.env.OPENAI_API_KEY)
const app = express();

app.use(cors())
app.use(express.json())

const systemPromt = `Sen eşsiz sorular üreten bir araçsın. Kullanıcıdan ne hakkında soru üretileceğini - sorunun zorluğunu alarak aşağıdaki formatta soru üreteceksin.

question:
answer1:
answer2:
answer3:
answer4:
correctAnswer:

- Yukarıdaki formatın asla dışına çıkma
- Sorunun doğru cevabı misal answer2 olduğunu varsayalım answer2'yi correctAnswer'ın içine yaz.
- Eğer sorunun konusu hakkında bi bilgin yoksa "Soru Üretilemedi" döndür, soru üretme hariç hiçbir yazıya cevap verme.
- Verdiğin bütün cevaplar yukarıdaki formatta olucak.
- Sadece 1 tane soru üret. 
- Sorular ve cevapları kesinlikle türkçe olucak.
- Her zaman yaratıcı sorular üret.
- Sakın sorular şu şekilde olmasın "Html nedir ?" - "Css nedir ?" bu formatta bilindik sorular asla ama asla sorma.
- Sorular bu kod ne işe yarar tarzında olsun.`

app.get('/', (req, res) => {
    res.send('api calisiyor')
});
app.post('/create-test', async (req, res) => {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: systemPromt
            },
            {
                role: "user",
                content: `${req.body.difficulty} - ${req.body.topic} `
            }
        ]
    });
    function parseString(inputString) {
        // Boşluklara dikkat ederek satırları ayrıştırma
        const lines = inputString.split("\n").filter(line => line.trim() !== "");

        // Sonuçları depolamak için boş bir obje oluşturma
        const result = {};

        // Her satırı işleme alma
        lines.forEach(line => {
            // Satırdaki anahtar ve değeri ayrıştırma
            const [key, value] = line.split(":").map(item => item.trim());

            // Anahtar değerine göre sonuç objesine eklemeler yapma
            if (key === "question") {
                result.question = value;
            } else if (key.startsWith("answer")) {
                const answerIndex = key.slice(-1);
                result[`answer${answerIndex}`] = value;
            } else if (key === "correctAnswer") {
                result.correctAnswer = value;
            }
        });
        
        return result;
    }
    const parsedResult = parseString(completion.data.choices[0].message.content);
    res.send(parsedResult);
});


app.listen(3001, () => console.log("3001 portu dinleniyor"))
