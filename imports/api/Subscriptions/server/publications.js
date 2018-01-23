/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import Perlin from 'loms.perlin';
import Subscriptions from '../Subscriptions';

Perlin.seed(Math.random());

Meteor.publishTransformed('userSubsToFires', function transform() {
  // https://en.wikipedia.org/wiki/Location_obfuscation
  // https://en.wikipedia.org/wiki/Decimal_degrees#Precision
  // https://gis.stackexchange.com/questions/27792/what-simple-effective-techniques-for-obfuscating-points-are-available
  return Subscriptions.find().serverTransform(function transformDoc(odoc) {
    const doc = odoc;
    // Destructuring gives me an error: "Cannot destructure property `location` of 'undefined'"
    const location = doc.location;
    /* doc.lat = location.lat;
     * doc.lon = location.lon; */
    let lat;
    let lon;
    if (location) {
      lat = Math.round(location.lat * 10) / 10;
      lon = Math.round(location.lon * 10) / 10;
      // console.log(`[${lat}, ${lon}]`);
      const noiseBase = Perlin.perlin2(lat, lon);
      const noise = Math.abs(noiseBase / 3);
      // console.log(`Noise ${noise}, abs: ${Math.abs(noise)}`);
      lat += noise;
      lon += noise;
      doc.location.lat = lat;
      doc.location.lon = lon;
      doc.distance += noiseBase;
    }
    // console.log(`with noise: [${doc.lat}, ${doc.lon}]`);
    delete doc.chatId;
    delete doc.geo;
    return doc;
  });
});

Meteor.publish('mysubscriptions', function subscriptions() {
  return Subscriptions.find({ owner: this.userId, type: 'web' });
});

// Note: subscriptions.view is also used when editing an existing subscription.
Meteor.publish('subscriptions.view', function subscriptionsView(subscriptionId) {
  check(subscriptionId, String);
  const id = new Mongo.ObjectID(subscriptionId);
  check(id, Meteor.Collection.ObjectID);
  return Subscriptions.find({ _id: id, owner: this.userId, type: 'web' });
});
