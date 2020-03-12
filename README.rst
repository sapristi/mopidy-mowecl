****************************
Mopidy-Mowecl
****************************

.. image:: https://img.shields.io/pypi/v/Mopidy-Mowecl
    :target: https://pypi.org/project/Mopidy-Mowecl/
    :alt: Latest PyPI version

.. image:: https://img.shields.io/circleci/build/gh/sapristi/mopidy-mowecl
    :target: https://circleci.com/gh/sapristi/mopidy-mowecl
    :alt: CircleCI build status

Web client providing a clean and ergonomic interface to Mopidy.

Presentation
============

- dual panel library / tracklist
- library / playlists / search results displayed as a single tree view
- drag and drop from library to tracklist
- save tracklist + current track as a bookmark (virtual playlist)

.. image:: https://mopidy.com/media/ext/mowecl.png
   :target: https://mopidy.com/media/ext/mowecl.png
   :alt: Preview
   :width: 700px

Implementation
..............

Mopidy-Mowecl is written in Javascript, and is built upon React, Redux and Material-ui.


Installation
============

Install by running::

    python3 -m pip install Mopidy-Mowecl


Configuration
=============

Before starting Mopidy, you must add configuration for
Mopidy-Mowecl to your Mopidy configuration file::

    [mowecl]
    # No configuration required


Project resources
=================

- `Mopidy extension page <https://mopidy.com/ext/mowecl>`_
- `Source code <https://github.com/sapristi/mopidy-mowecl>`_
- `Issue tracker <https://github.com/sapristi/mopidy-mowecl/issues>`_
- `Changelog <https://github.com/sapristi/mopidy-mowecl/blob/master/CHANGELOG.rst>`_


Credits
=======

- Original author: `Mathias Millet <https://github.com/sapristi>`__
- Current maintainer: `Mathias Millet <https://github.com/sapristi>`__
- `Contributors <https://github.com/sapristi/mopidy-mowecl/graphs/contributors>`_
