import moment from 'moment';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

export function countdown(
  deadline: moment.Moment,
  tick?: (number) => void
): Observable<moment.Duration> {
  deadline = moment.isMoment(deadline) ? deadline : moment(deadline);

  const finish = new Subject<boolean>();
  return timer(0, 1000)
    .pipe(takeUntil(finish))
    .pipe<moment.Duration>(
      map((): moment.Duration => {
        const difference = deadline.diff(Date.now());
        if (moment.duration(difference).asSeconds() <= -1) {
          finish.next(true);
          finish.complete();
          return moment.duration(0);
        } else {
          if (tick) {
            tick(difference);
          }
          return moment.duration(difference);
        }
      })
    );
}
