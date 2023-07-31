import dayjs, { type Dayjs } from 'dayjs';
import duration, {
    type Duration as DayjsDuration,
} from 'dayjs/plugin/duration';

dayjs.extend(duration);

export type Moment = Dayjs;

export type Duration = DayjsDuration;
