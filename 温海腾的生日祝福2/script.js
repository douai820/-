// --- 配置区 ---
// ！！！极其重要提醒！！！
// 将 API Key 直接写在前端代码中是非常不安全的做法！
// 任何人都可以通过查看网页源代码获取你的 Key。
// 这个方法仅适用于一次性、私密分享的场景，并且强烈建议生日过后：
// 1. 立即在 DeepSeek 官网禁用或删除此 API Key。
// 2. 或者将 GitHub 仓库设为私有（如果 Pages 功能允许）。
// 3. 或者直接删除仓库或代码中的 Key。
// 对于任何需要长期使用或公开的场景，请务必使用后端服务来代理 API 请求。
const apiKey = "sk-800b539b2bfe4d43b0a6c51f8df35443"; // 替换成你的 DeepSeek API Key
const apiUrl = "https://api.deepseek.com/chat/completions";
const modelToUse = "deepseek-chat"; // 使用通用的 chat 模型。如果 R1 有特定 API 标识符，请替换这里。

// --- 获取 HTML 元素 ---
const loadingIndicator = document.getElementById('loading-indicator');
const blessingTextElement = document.getElementById('blessing-text');
const errorMessageElement = document.getElementById('error-message');

// --- 精心构造 Prompt ---
const recipientName = "温海腾";
const relationshipInfo = "她是我高中家教姐姐，现在是清华/北大的研究生。我们关系很好，她像姐姐一样照顾和鼓励我，我也很敬佩她。她把我当弟弟看，明确说过界限，所以祝福需保持在这个定位上，绝对不能有任何男女朋友间的暧昧或暗示。";
const recipientTraits = "性格非常乐观开朗，热爱生活，喜欢到处旅游探索，也喜欢看剧放松，是个闲不住、充满活力的人。";
const occasion = "她的生日";
const desiredToneAndStyle = "语气要真诚、温暖、积极向上，带着弟弟对优秀姐姐的欣赏和祝福。可以适当结合她爱玩、爱探索的特点。语言可以轻松活泼一点，或者带点含蓄的诗意。";
const outputRequirements = "直接生成一段生日祝福语正文，大约100-200字。请以‘海腾姐姐，生日快乐！’或类似的亲切称呼开头。结尾包含美好的祝愿即可，无需署名。请不要在祝福语前后添加任何解释性文字或引号。";

const prompt = `
请根据以下信息，为一位姐姐生成一段生日祝福语：

收信人: ${recipientName} 姐姐
场合: ${occasion}
发送人与收信人的关系: ${relationshipInfo}
收信人特点: ${recipientTraits}
祝福语要求: ${desiredToneAndStyle} ${outputRequirements}
`;

// --- 主函数：调用 API 并处理结果 ---
async function fetchBirthdayBlessing() {
    console.log("开始获取生日祝福..."); // 调试日志
    loadingIndicator.style.display = 'flex'; // 显示加载动画
    blessingTextElement.style.display = 'none';
    errorMessageElement.style.display = 'none';

    // 打印将要发送的 Prompt，方便调试
    console.log("构造的 Prompt:\n", prompt);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelToUse,
                messages: [
                    // 可以加一个 System Message 辅助设定角色或风格
                    { role: "system", content: "你是一位擅长拿捏文字分寸、可以根据用户要求写出真挚祝福语的 AI 助手。" },
                    { role: "user", content: prompt }
                ],
                max_tokens: 300, // 限制最大长度
                temperature: 0.75, // 稍微降低一点点，让输出更稳定，但仍有创意
                stream: false
            })
        });

        // --- 更详细的响应状态检查 ---
        if (!response.ok) {
            let errorPayload = null;
            try {
                errorPayload = await response.json(); // 尝试解析错误信息体
                console.error('API 请求失败，服务器返回错误:', errorPayload);
            } catch (e) {
                console.error('API 请求失败，且无法解析错误响应体:', response.status, response.statusText);
            }
            // 根据 HTTP 状态码给出更具体的提示
            let userErrorMessage = `请求祝福语失败 (HTTP ${response.status})。`;
            if (response.status === 401) {
                userErrorMessage += " 看起来像是 API Key 无效或未授权。";
            } else if (response.status === 429) {
                userErrorMessage += " 请求过于频繁，请稍后再试。";
            } else if (response.status >= 500) {
                userErrorMessage += " 服务器端似乎出了点问题。";
            }
            throw new Error(userErrorMessage); // 抛出包含状态码的错误
        }

        // --- 解析成功的响应 ---
        const data = await response.json();
        console.log("API 原始返回数据:", data); // 调试日志

        // --- 健壮地提取祝福语 ---
        let blessing = null;
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            blessing = data.choices[0].message.content.trim();
            console.log("成功提取到祝福语:", blessing);
        } else {
            console.error("API 返回的数据结构不符合预期:", data);
            throw new Error("抱歉，AI 返回的数据格式有点奇怪，没找到祝福语。");
        }

        // --- 显示祝福语 ---
        loadingIndicator.style.display = 'none'; // 隐藏加载
        errorMessageElement.style.display = 'none'; // 确保错误信息隐藏
        blessingTextElement.innerText = blessing;
        blessingTextElement.style.display = 'block'; // 显示祝福语

    } catch (error) {
        console.error('处理祝福语过程中发生错误:', error); // 完整错误信息打印到控制台

        // --- 显示用户友好的错误信息 ---
        loadingIndicator.style.display = 'none'; // 隐藏加载
        blessingTextElement.style.display = 'none'; // 隐藏可能存在的旧祝福语
        // 显示具体的错误消息，如果是网络错误等，error.message 会包含信息
        errorMessageElement.innerText = `加载祝福语时遇到问题 T_T\n(${error.message})\n\n不过，心意最重要！海腾姐姐，生日快乐！祝你新的一岁更加精彩！`;
        errorMessageElement.style.display = 'block'; // 显示错误信息
    }
}

// --- 页面加载完成后执行 ---
// 使用 DOMContentLoaded 通常比 onload 更快，因为它不等待图片等资源加载
document.addEventListener('DOMContentLoaded', fetchBirthdayBlessing);