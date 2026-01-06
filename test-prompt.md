# State Increment Task

speak out each thing that you are going to do as a single sentance. for example: turn 1 reading the file. turn 2: writing the file, etc.
Read the file `state.txt` in the current directory. If it doesn't exist, create it with the value `1`.

If the file exists, read the current number and increment it by exactly 1, then write the new value back to `state.txt`.

## Completion Condition

When the value in `state.txt` reaches exactly `5`, output `<promise>COMPLETE</promise>` to signal completion.

Otherwise, do NOT output the completion promise - just report what value you wrote to state.txt.
