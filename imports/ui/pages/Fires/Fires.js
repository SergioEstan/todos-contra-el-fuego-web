/* eslint-disable import/no-absolute-path */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { translate, Trans } from 'react-i18next';
import { FormGroup } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Map, Circle } from 'react-leaflet';
import Blaze from 'meteor/gadicc:blaze-react-component';
import DefMapLayers from '/imports/ui/components/Maps/DefMapLayers';
import NotFound from '/imports/ui/pages/NotFound/NotFound';
import FiresCollection from '/imports/api/Fires/Fires';
import FromNow from '/imports/ui/components/FromNow/FromNow';
import { dateLongFormat } from '/imports/api/Common/dates';
import '/imports/startup/client/comments';
import FalsePositiveTypes from '/imports/api/FalsePositives/FalsePositiveTypes';
import './Fires.scss';

class Fire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      when: props.when
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.when !== nextProps.when) {
      // console.log(`Next when ${nextProps.when}`);
      this.setState({
        when: nextProps.when
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextState.when === this.state.when);
  }

  onTypeSelect(key) {
    // console.log(key);
    Meteor.call('falsePositives.insert', this.props.fire._id, key, (error) => {
      if (error) {
        // console.log(error);
        Bert.alert(this.props.t(error.reason), 'danger');
      } else {
        Bert.alert(this.props.t('Tomamos nota, ¡gracias por colaborar!'), 'success');
      }
    });
  }

  render() {
    const { loading, fire, t } = this.props;
    if (fire && fire.when) {
      this.dateLongFormat = dateLongFormat(fire.when);
    }
    return (fire ? (
      <div className="ViewFire">
        {!loading &&
         <Fragment>
           <h4 className="page-header">
             {fire.address ?
              t('Información adicional sobre fuego detectado en {{where}} el {{when}}', { where: fire.address, when: this.dateLongFormat }) :
              t('Información adicional sobre fuego detectado el {{when}}', { when: this.dateLongFormat })}
           </h4>

           <Map
               ref={(map) => {
                   this.fireMap = map;
                 }}
               animate
               sleep={false}
               center={[fire.lat, fire.lon]}
               className="fire-leaflet-container"
               zoom={12}
           >
             <Fragment>
               <Circle
                   center={[fire.lat, fire.lon]}
                   color="red"
                   fillColor="red"
                   fillOpacity={0.1}
                   radius={fire.scan ? fire.scan * 1000 : 300}
               />
             </Fragment>
             <DefMapLayers />
           </Map>
           <p>{t('Coordenadas:')} {fire.lat}, {fire.lon}</p>
           {(fire.type === 'modis' || fire.type === 'viirs') &&
            <p><Trans>Fuego detectado por satélites de la NASA <FromNow {...this.props} /></Trans></p>
           }
            {(fire.type === 'vecinal') &&
             <p><Trans>Fuego notificado por uno de nuestros usuarios/as <FromNow {...this.props} /></Trans></p>
            }

             {(fire.type !== 'vecinal') &&
              <Fragment>
                <h5>{t('¿No es un fuego forestal?')}</h5>
                <div>
                  <Trans>Indícanos de que tipo de fuego se trata y ayúdanos así a mejorar nuestras notificaciones:</Trans>
                </div>
                <FormGroup>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm dropdown-toggle lang-selector" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      {'Elige un tipo'}
                    </button>
                    <div className="dropdown-menu">
                      {Object.keys(FalsePositiveTypes).map(key => (
                         <button
                             className="dropdown-item"
                             onClick={() => this.onTypeSelect(key)}
                             key={key}
                             type="button"
                         >
                           {FalsePositiveTypes[key]}
                         </button>
                       ))
                      }
                    </div>
                  </div>
                </FormGroup>
              </Fragment> }

              <h4>{t('Comentarios')}</h4>
              <div className="comments-info">
                {t('Puedes añadir un comentario si tienes información adicional sobre este fuego.')}
                {' '}
                {t('Por ejemplo:')}
                <ul>
                  <li>{t('si conoces esta zona y cómo acceder al fuego (esto puede de ser de ayuda para apagarlo si sigue activo o para investigarlo en un futuro)')}</li>
                  <li>{t('si conoces el motivo por el que comenzó el fuego')}</li>
                  <li>{t('si quieres denunciar algún tipo de ilegalidad, incluso anónimamente')}</li>
                  <li>{t('o cualquier otra información')}</li>
                </ul>
              </div>
              <div className="comments-section">
                <Blaze template="commentsBox" id={`fire-${fire._id}`} />
              </div>
         </Fragment>
        }
      </div>
    ) : <NotFound />);
  }
}

Fire.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  when: PropTypes.instanceOf(Date),
  fire: PropTypes.object
};

Fire.defaultProps = {
};

// export default translate([], { wait: true })(withTracker((props) => {

const FireContainer = withTracker(({ match }) => {
  const fireEncrypt = match.params.id;
  const subscription = Meteor.subscribe('fireFromHash', fireEncrypt);
  // console.log(`Subs ready: ${subscription.ready()}, fire: ${JSON.stringify(FiresCollection.findOne())}`);
  return {
    loading: !subscription.ready(),
    fire: FiresCollection.findOne(),
    when: subscription.ready() ? FiresCollection.findOne().when : null
  };
})(Fire);

// export default FireContainer;
export default translate([], { wait: true })(FireContainer);
