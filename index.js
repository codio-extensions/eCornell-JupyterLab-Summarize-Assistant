// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {

  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("customSummarizerJupyter", "Summarize what I need to do!", onButtonPress)

  // function called when I have a question button is pressed
  async function onButtonPress() {

    // automatically collects all available context 
    let context = await codioIDE.coachBot.getContext()
    // console.log(context)
    
    // select open jupyterlab notebook related context
    let openJupyterFileContext = context.jupyterContext[0]
    let jupyterFileName = openJupyterFileContext.path
    let jupyterFileContent = openJupyterFileContext.content
    
    // filter and map cell indices of markdown cells into a new array
    const markdownCells = jupyterFileContent.map(
        ({ id, ...rest }, index) => ({
              cell: index,
            ...rest
        })).filter(
            obj => obj.type === 'markdown'
        )
    // console.log("markdown", JSON.stringify(markdownCells))

    // Define your assistant's prompts here
    // this is where you will provide the role definition, examples and the context you collected,
    // along with the task you want the LLM to generate text for.
            
    const systemPrompt = `You are an assistant helping students understand their programming assignments.
Given a programming assignment, your job is to provide a 1-2 sentence summary of the task described in the assignment, and a short list of its requirements.
Note that you will respond without xml tags and only the task summary, starting with Summary: , and the list of requirements starting with Requirements:
If no assignment is given, respond with Nothing to summarize. 
Do not provide code or the full solution. 
Do not ask if there are any more questions.`
        
    const userPrompt = `Here are the instructions for the assignment:

<assignment>
${JSON.stringify(markdownCells)}
</assignment> 

Phrase your explanation directly addressing the student as 'you'. 

`

    const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: [{"role": "user", "content": userPrompt}]
    })
       
  }

})(window.codioIDE, window)
