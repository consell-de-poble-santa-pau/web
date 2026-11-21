// Camp «Difusió per WhatsApp» del formulari de l'Agenda.
// Prepara el missatge de la convocatòria a partir dels altres camps i ofereix
// dos botons: copiar-lo i obrir el WhatsApp amb el text ja escrit.
// No desa res a l'entrada: només ajuda a difondre-la.
(function () {
  if (!window.CMS || !window.h) return;
  var h = window.h;
  var React = window.CMS.React;
  var WEB = 'https://consell-de-poble-santa-pau.pages.dev';

  // Noms dels cercles per a l'encapçalament del missatge. Si se'n crea un de
  // nou i no és aquí, surt el nom tal com és al títol, i prou.
  var CERCLES = {
    coordinacio: 'Cercle de Coordinació',
    comunicacio: 'Cercle de Comunicació',
    aigua: "Cercle de l'Aigua",
    'salut-comunitaria': 'Cercle de Salut Comunitària',
    habitatge: "Cercle d'Habitatge",
  };
  var DIES = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
  var MESOS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];

  function dataLlarga(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '';
    var a = +m[1], me = +m[2], d = +m[3];
    var dia = DIES[new Date(Date.UTC(a, me - 1, d)).getUTCDay()];
    var mes = MESOS[me - 1];
    var de = /^[aeiou]/.test(mes) ? "d'" : 'de ';
    return dia + ' ' + d + ' ' + de + mes;
  }

  function missatge(d) {
    var linies = [];
    var titol = (d.titol || '').trim() || 'Trobada del Consell de Poble';
    linies.push(d.cancellada ? '*CANCEL·LADA:* ' + titol : '*' + titol + '*');
    var quan = dataLlarga(d.data);
    if (quan) {
      var hores = d.hora ? (d.horaFi ? 'de ' + d.hora + ' a ' + d.horaFi + ' h' : 'a les ' + d.hora + ' h') : '';
      linies.push(quan + (hores ? ', ' + hores : ''));
    }
    if (d.lloc) linies.push('Lloc: ' + d.lloc);
    var cercle = CERCLES[d.cercle];
    if (cercle && titol.indexOf(cercle.replace(/^Cercle (de |d')/, '')) === -1) linies.push('Convoca: ' + cercle);
    if (!d.cancellada) linies.push(d.oberta === false ? 'Reunió de treball del cercle.' : 'Oberta a tothom.');
    if (d.nota) linies.push('Nota: ' + d.nota);
    linies.push('', 'Més informació: ' + WEB + '/agenda/' + (d.slug ? '#esd-' + d.slug : ''));
    return linies.join('\n');
  }

  function Control(props) {
    var estat = React.useState('');
    var avis = estat[0], setAvis = estat[1];
    var e = props.entry;
    // L'entrada arriba com a Immutable Map; per si de cas, també s'accepta un objecte normal.
    var dades = e ? (typeof e.get === 'function' ? e.get('data') : e.data) : null;
    var get = function (k) {
      if (!dades) return undefined;
      var v = typeof dades.get === 'function' ? dades.get(k) : dades[k];
      return typeof v === 'string' ? v.trim() : v;
    };
    var slug = e ? (typeof e.get === 'function' ? e.get('slug') : e.slug) || '' : '';
    var text = missatge({
      titol: get('titol'), data: get('data'), hora: get('hora'), horaFi: get('horaFi'),
      lloc: get('lloc'), cercle: get('cercle'), oberta: get('oberta'), cancellada: get('cancellada'),
      nota: get('nota'), slug: slug,
    });
    var copia = function () {
      var fet = function () { setAvis('Copiat. Ara enganxa’l al canal.'); setTimeout(function () { setAvis(''); }, 4000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(fet, function () { setAvis('No s’ha pogut copiar: selecciona el text i copia’l a mà.'); });
      } else {
        setAvis('Selecciona el text i copia’l a mà.');
      }
    };
    var boto = {
      display: 'inline-block', padding: '.5rem .9rem', borderRadius: '6px', border: '1px solid currentColor',
      background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer', textDecoration: 'none',
    };
    return h('div', { className: props.classNameWrapper, id: props.forID },
      h('pre', {
        style: {
          whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '0 0 .75rem', padding: '.75rem',
          border: '1px solid rgba(127,127,127,.35)', borderRadius: '6px', userSelect: 'all',
        },
      }, text),
      h('div', { style: { display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' } },
        h('button', { type: 'button', onClick: copia, style: boto }, 'Copia el missatge'),
        h('a', {
          href: 'https://wa.me/?text=' + encodeURIComponent(text), target: '_blank', rel: 'noopener noreferrer',
          style: Object.assign({}, boto, { background: '#25D366', color: '#08361c', borderColor: '#25D366' }),
        }, 'Obre el WhatsApp'),
        avis ? h('span', { role: 'status' }, avis) : null
      ),
      dades ? null : h('p', { style: { marginTop: '.5rem', color: '#b3261e' } },
        'No puc llegir els altres camps del formulari. Avisa la persona que administra el web.')
    );
  }

  window.CMS.registerFieldType('difusio-whatsapp', Control);
})();
