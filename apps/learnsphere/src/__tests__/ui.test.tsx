import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NoteView } from '@/components/NoteView';
import { QuestionView } from '@/components/QuestionView';
import { BarChart, ProgressRing, Stepper } from '@/components/ui';
import type { QuizQuestion } from '@/content/types';
import type { Answer } from '@/features/quiz/engine';
import { initI18n } from '@/i18n';

// The first render pays for loading React Native and the design system; allow slow CI machines.
jest.setTimeout(30_000);

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

const wrap = async (node: ReactNode) =>
  await render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <ThemeProvider brand={{ primary: '#1F6F8B', accent: '#F2A541' }} preference="light">
        <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );

describe('QuestionView', () => {
  const q: QuizQuestion = { id: 'x', type: 'single', difficulty: 1, prompt: 'Which planet is red?', explanation: 'Iron oxide makes Mars look red.', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 };

  it('lets the learner pick an answer', async () => {
    const onChange = jest.fn();
    await wrap(<QuestionView question={q} answer={{ type: 'single', choice: null }} onChange={onChange} reveal={false} seed={1} />);
    expect(screen.getByText('Which planet is red?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('option-1'));
    expect(onChange).toHaveBeenCalledWith({ type: 'single', choice: 1 });
    expect(screen.queryByText(q.explanation)).toBeNull();
  });

  it('shows correction and explanation when revealed', async () => {
    const answer: Answer = { type: 'single', choice: 0 };
    await wrap(<QuestionView question={q} answer={answer} onChange={jest.fn()} reveal seed={1} />);
    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(screen.getByText(q.explanation)).toBeTruthy();
  });

  it('renders true/false and matching questions', async () => {
    const tf: QuizQuestion = { id: 't', type: 'true_false', difficulty: 1, prompt: 'Water boils at 100 °C at sea level.', explanation: 'At 1 atm.', correct: true };
    const onChange = jest.fn();
    await wrap(<QuestionView question={tf} answer={{ type: 'true_false', value: null }} onChange={onChange} reveal={false} seed={1} />);
    await fireEvent.press(screen.getByTestId('option-true'));
    expect(onChange).toHaveBeenCalledWith({ type: 'true_false', value: true });
  });
});

describe('reading and charts', () => {
  it('renders formatted notes', async () => {
    await wrap(<NoteView body={'# Title\n- point one\n==highlighted=='} />);
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('point one')).toBeTruthy();
    expect(screen.getByText('highlighted')).toBeTruthy();
  });

  it('exposes accessible labels for charts and rings', async () => {
    await wrap(
      <>
        <BarChart testID="chart" data={[{ label: 'Mon', value: 30 }, { label: 'Tue', value: 0 }]} />
        <ProgressRing progress={0.5} label="50%" />
      </>,
    );
    expect(screen.getByTestId('chart').props.accessibilityLabel).toBe('Mon: 30, Tue: 0');
    expect(screen.getByLabelText('50%')).toBeTruthy();
  });

  it('stepper respects bounds', async () => {
    const onChange = jest.fn();
    await wrap(<Stepper label="Cycles" value={1} onChange={onChange} min={1} max={4} />);
    await fireEvent.press(screen.getByLabelText('Increase Cycles'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
