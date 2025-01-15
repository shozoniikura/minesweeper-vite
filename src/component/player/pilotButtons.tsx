import { AUTO_PILOT, NEW_FEATURE, PROBABILITY } from "../../lib/mskai/constants";

const choiceHandler = (onClick: (x: number)=>void, handlerType: number) => {
  const fn = (): void => onClick(handlerType);
  return fn;
}

const selectLabel = (handlerType: number): string => {
  switch (handlerType) {
    case AUTO_PILOT:
      return 'AUTO';
    case NEW_FEATURE:
      return 'FEAT';
    case PROBABILITY:
      return 'PROB';
    default:
      return 'AUTO';
  }
}

const AnalyzeButton = (props: { onClick: () => void, handlerType: number }) => {
  const {onClick, handlerType} = props;
  const handler = choiceHandler(onClick, handlerType);
  const label = selectLabel(handlerType);
  return (
    <button onClick={handler}>{label}</button>
  );
};

export const PilotStartButton = (props: { onClick: () => void}) => {
  return <AnalyzeButton onClick={props.onClick} handlerType={AUTO_PILOT} />
}

export const NewFeatureButton = (props: { onClick: () => void}) => {
  return <AnalyzeButton onClick={props.onClick} handlerType={NEW_FEATURE} />
}

export const ProbabilityButton = (props: { onClick: () => void}) => {
  return <AnalyzeButton onClick={props.onClick} handlerType={PROBABILITY} />
}
