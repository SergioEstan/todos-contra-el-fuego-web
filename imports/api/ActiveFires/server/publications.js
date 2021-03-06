/* global Counter */
/* eslint-disable import/no-absolute-path */
/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { NumberBetween } from '/imports/modules/server/other-checks';
import { whichAreFalsePositives } from '/imports/api/FalsePositives/server/publications';
import ActiveFires from '../ActiveFires';

const counter = new Counter('countActiveFires', ActiveFires.find({}));

Meteor.publish('activefirestotal', function total() {
  return counter;
});

const activefires = (northEastLng, northEastLat, southWestLng, southWestLat, withMarks) => {
  const fires = ActiveFires.find({
    ourid: {
      $geoWithin: {
        $box: [
          [southWestLng, southWestLat],
          [northEastLng, northEastLat]
        ]
      }
    }
  }, {
    fields: {
      lat: 1,
      lon: 1,
      when: 1,
      scan: 1
    }
  });

  // console.log(JSON.stringify(result));
  // console.log(`Fires total: ${fires.count()}`);

  if (withMarks && fires.fetch().length > 0) {
    const falsePos = whichAreFalsePositives(fires);
    return [fires, falsePos];
  }

  return fires;
};

Meteor.publish('activefiresmyloc', function activeInMyLoc(northEastLng, northEastLat, southWestLng, southWestLat, withMarks) {
  // latitude -90 and 90 and the longitude between -180 and 180
  check(northEastLng, NumberBetween(-180, 180));
  check(southWestLat, NumberBetween(-90, 90));
  check(southWestLng, NumberBetween(-180, 180));
  check(northEastLat, NumberBetween(-90, 90));
  check(withMarks, Boolean);

  return activefires(northEastLng, northEastLat, southWestLng, southWestLat, withMarks);
});
