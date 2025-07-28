import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SupportTrackerSimple = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Support Tracker - Teste Simples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={() => setCount(count - 1)}>-</Button>
            <span className="text-2xl font-bold">{count}</span>
            <Button onClick={() => setCount(count + 1)}>+</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTrackerSimple;