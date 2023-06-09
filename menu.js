import { dispatch } from 'd3';
export const menu = () => {
  let id;
  let labelText;
  let options;
  const listeners = dispatch('change');
  const my = (selection) => {
    // the selection is div
    selection
      .selectAll('label')
      .data([null])
      .join('label')
      .attr('for', id)
      .text(labelText);

    selection
      .selectAll('select')
      .data([null])
      .join('select')
      .attr('name', id)
      .attr('id', id)
      .on('change', (event) => {
        //console.log(event.target.value);
        listeners.call(
          'change',
          null,
          event.target.value
        );
      })
      .selectAll('option')
      .data(options)
      .join('option')
      .attr('value', (d) => d.value)
      .text((d) => d.text);
  };

  my.id = function (_) {
    return arguments.length
      ? ((id = _), my) //return my
      : id;
  };
  my.labelText = function (_) {
    return arguments.length
      ? ((labelText = _), my) //return my
      : labelText;
  };

  my.options = function (_) {
    return arguments.length
      ? ((options = _), my) //return my
      : options;
  };

  my.on = function () {
    let value = listeners.on.apply(
      listeners,
      arguments
    );
    return value === listeners ? my : value;
  };
  return my;
};