
export const useFunctionInsertion = () => {
  // Function to handle function insertion in the right format
  const handleInsertFunction = (func: any, index: number, insertFunctionToExpression: (index: number, functionText: string) => void) => {
    insertFunctionToExpression(index, func.syntax || func.name + "()");
  };

  return {
    handleInsertFunction
  };
};
