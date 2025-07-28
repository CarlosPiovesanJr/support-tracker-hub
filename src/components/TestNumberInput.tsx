import React, { useState } from 'react';
import { NumberInputWithControls } from '@/components/ui/number-input-with-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestNumberInput = () => {
  const [value, setValue] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste NumberInputWithControls</CardTitle>
      </CardHeader>
      <CardContent>
        <NumberInputWithControls
          label="Teste de Input"
          value={value}
          onChange={setValue}
          placeholder="Digite um número"
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Valor atual: {value}
        </p>
      </CardContent>
    </Card>
  );
};

export default TestNumberInput;