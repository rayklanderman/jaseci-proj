
import from byllm.llm { Model }
glob llm = Model(model_name="gemini/gemini-2.0-flash");
def quick_analyze(task: str) -> str by llm();
with entry {
    result = quick_analyze("Categorize 'Schedule dentist appointment' as work/personal/health/learning and priority as high/medium/low. Format: category,priority,reason");
    print(result);
}
