import { Pipe, PipeTransform } from '@angular/core';
import { Entity } from '../common';
import { BuzzerTeam } from './model';

@Pipe({
    name: 'team',
    pure: true,
})
export class BuzzerTeamPipe implements PipeTransform {
    public transform(
        teamId: string | null,
        teams: Entity<BuzzerTeam>[],
    ): BuzzerTeam | undefined {
        if (!teamId) {
            return undefined;
        } else {
            return teams.find((t) => t.firebaseId === teamId);
        }
    }
}
